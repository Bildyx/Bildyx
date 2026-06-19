using System.Text;
using System.Threading.RateLimiting;
using BildixApi.Data;
using BildixApi.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// Phase 8.2 — structured logging. Console everywhere; rolling file in production.
builder.Host.UseSerilog((context, config) =>
{
    config.ReadFrom.Configuration(context.Configuration)
          .Enrich.FromLogContext()
          .WriteTo.Console();
    if (!context.HostingEnvironment.IsDevelopment())
        config.WriteTo.File("logs/bildix-.log", rollingInterval: RollingInterval.Day);
});

// Phase 8.3 — Sentry error tracking, active only when a DSN is configured
// (set Sentry:Dsn via env/user-secrets). No-op otherwise.
if (!string.IsNullOrWhiteSpace(builder.Configuration["Sentry:Dsn"]))
    builder.WebHost.UseSentry();

builder.Services.AddControllers();

builder.Services.AddDbContext<BildixDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// ── CORS — allow the Vite dev server (and a configurable prod origin) ───────
// Configure prod origins via "Cors:AllowedOrigins" (array) in env/appsettings.
const string CorsPolicy = "frontend";
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
    ?? ["http://localhost:5173", "http://localhost:3000"];
builder.Services.AddCors(options =>
    options.AddPolicy(CorsPolicy, policy =>
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()));

builder.Services.AddScoped<JwtTokenService>();
builder.Services.AddScoped<RefreshTokenService>();
builder.Services.AddHttpClient<TurnstileService>();
builder.Services.AddSingleton<MatchingService>();
// Phase 7.2: logging email by default. Replace with a provider impl when an
// email account is configured.
builder.Services.AddScoped<IEmailService, LoggingEmailService>();
// Phase 7.5: local-disk storage by default; swap for Supabase Storage in prod.
builder.Services.AddSingleton<IStorageService, LocalStorageService>();

// ── JWT authentication ─────────────────────────────────────────────────────
// SECRET KEY MUST COME FROM ENVIRONMENT IN PRODUCTION — never from appsettings.json.
// Development: set via `dotnet user-secrets set "Jwt:SecretKey" "<your-key>"`
// Production:  set via environment variable Jwt__SecretKey
var jwtConfig = builder.Configuration.GetSection("Jwt");
var secretKey = Encoding.UTF8.GetBytes(jwtConfig["SecretKey"]!);

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer           = true,
            ValidateAudience         = true,
            ValidateLifetime         = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer              = jwtConfig["Issuer"],
            ValidAudience            = jwtConfig["Audience"],
            IssuerSigningKey         = new SymmetricSecurityKey(secretKey),
            ClockSkew                = TimeSpan.Zero,
        };
    });

builder.Services.AddAuthorization();

// ── Rate limiting — protects auth endpoints against brute force ─────────────
// "auth-policy": max 10 attempts per sliding 1-minute window per IP.
// Exceeding this returns 429 Too Many Requests.
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    options.AddSlidingWindowLimiter("auth-policy", limiter =>
    {
        limiter.PermitLimit         = 10;
        limiter.Window              = TimeSpan.FromMinutes(1);
        limiter.SegmentsPerWindow   = 6;
        limiter.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        limiter.QueueLimit          = 0;
    });

    // "create-policy": throttle resource-creation endpoints to curb spam
    // (fake profiles, job/team flooding). 20 writes per minute per IP.
    options.AddSlidingWindowLimiter("create-policy", limiter =>
    {
        limiter.PermitLimit         = 20;
        limiter.Window              = TimeSpan.FromMinutes(1);
        limiter.SegmentsPerWindow   = 6;
        limiter.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        limiter.QueueLimit          = 0;
    });

    // Global policy applied to all other endpoints (scraping / abuse protection).
    // 120 req/min per IP — generous enough for real users, blocks mass scrapers.
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(ctx =>
        RateLimitPartition.GetSlidingWindowLimiter(
            ctx.Connection.RemoteIpAddress?.ToString() ?? "anon",
            _ => new SlidingWindowRateLimiterOptions
            {
                PermitLimit         = 120,
                Window              = TimeSpan.FromMinutes(1),
                SegmentsPerWindow   = 6,
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                QueueLimit          = 0,
            }));
});

// Phase 8.1 — health check (DB reachability), exposed at /health (anonymous).
builder.Services.AddHealthChecks().AddCheck<DbHealthCheck>("database");

builder.Services.AddEndpointsApiExplorer();
// Phase 2.9 — generate the OpenAPI document from the live endpoints so the API
// docs always stay in sync with the hand-written controllers.
builder.Services.AddOpenApi();

var app = builder.Build();

app.UseSerilogRequestLogging();

// ── Database migrations + seed ──────────────────────────────────────────────
// Migrations are applied on startup in every environment (Phase 6.6).
// Demo data is seeded only in Development. Both are idempotent.
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<BildixDbContext>();
    await db.Database.MigrateAsync();
    if (app.Environment.IsDevelopment())
        await SeedData.InitializeAsync(db);
}

// ── Security headers ────────────────────────────────────────────────────────
// Applied to every response. Prevents common client-side attacks.
app.Use(async (context, next) =>
{
    context.Response.Headers["X-Content-Type-Options"] = "nosniff";
    context.Response.Headers["X-Frame-Options"]        = "DENY";
    context.Response.Headers["Referrer-Policy"]        = "strict-origin-when-cross-origin";
    context.Response.Headers["X-XSS-Protection"]      = "0"; // Modern browsers ignore this; CSP is the real protection
    // This is a JSON API — lock CSP all the way down. Swagger UI (dev only) is
    // exempt because it needs to load its own scripts/styles.
    if (!context.Request.Path.StartsWithSegments("/swagger"))
        context.Response.Headers["Content-Security-Policy"] = "default-src 'none'; frame-ancestors 'none'";
    await next();
});

// HSTS in production only (dev runs over plain HTTP).
if (!app.Environment.IsDevelopment())
    app.UseHsts();

// ── Swagger UI (DEVELOPMENT ONLY) ──────────────────────────────────────────
// Never expose the full API spec in production — it reveals your attack surface.
if (app.Environment.IsDevelopment())
{
    // Live, auto-generated spec covering every current endpoint.
    app.MapOpenApi(); // served at /openapi/v1.json

    app.UseSwaggerUi(settings =>
    {
        settings.DocumentPath  = "/openapi/v1.json";
        settings.Path          = "/swagger";
        settings.DocumentTitle = "Bildix API";
    });
}

app.UseHttpsRedirection();
app.UseStaticFiles(); // serves uploaded avatars/logos from wwwroot/uploads
app.UseCors(CorsPolicy);
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapHealthChecks("/health").AllowAnonymous();

app.Run();
