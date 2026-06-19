using BildixApi.Data;
using BildixApi.Models;
using BildixApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;

namespace BildixApi.Controllers;

[ApiController]
[Route("api/v1/auth")]
[AllowAnonymous]
[EnableRateLimiting("auth-policy")] // Max 10 requests / minute / IP on all auth routes
public class AuthController(BildixDbContext db, JwtTokenService jwt, RefreshTokenService refreshTokens, TurnstileService turnstile) : Microsoft.AspNetCore.Mvc.ControllerBase
{
    // Pre-computed hash to avoid timing leaks when user does not exist.
    // Computing a fresh hash per request would add latency variance detectable by an attacker.
    private static readonly string DummyHash = BCrypt.Net.BCrypt.HashPassword("dummy-timing-protection");

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        var remoteIp = HttpContext.Connection.RemoteIpAddress?.ToString();
        if (!await turnstile.VerifyAsync(request.TurnstileToken, remoteIp))
            return BadRequest(new { error = new { code = "BOT_CHECK_FAILED", message = "Bot verification failed. Please try again." } });

        // Normalize email to prevent duplicate accounts with different casing
        var email = request.Email.Trim().ToLowerInvariant();

        if (await db.Users.AnyAsync(u => u.Email == email))
            return Conflict(new { error = new { code = "EMAIL_TAKEN", message = "Email address already in use" } });

        var role = request.Role == RegisterRequestRole.Candidate ? UserRole.Candidate : UserRole.Company;

        var user = new UserEntity
        {
            Email        = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role         = role,
        };

        // Auto-create a stub profile linked to the user. EF inserts the profile
        // and wires the FK via the navigation property.
        var displayName = string.IsNullOrWhiteSpace(request.Name) ? email.Split('@')[0] : request.Name.Trim();
        if (role == UserRole.Candidate)
            user.Candidate = new CandidateEntity { Name = displayName, Email = email, Title = request.Title };
        else
            user.Company = new CompanyEntity { Name = displayName, Sector = request.Sector };

        db.Users.Add(user);
        await db.SaveChangesAsync();

        var (token, expiresAt) = jwt.GenerateToken(user);
        var refresh = await refreshTokens.IssueAsync(user.Id);
        return CreatedAtAction(nameof(Register), ToAuthResponse(token, expiresAt, user, refresh));
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var remoteIp = HttpContext.Connection.RemoteIpAddress?.ToString();
        if (!await turnstile.VerifyAsync(request.TurnstileToken, remoteIp))
            return BadRequest(new { error = new { code = "BOT_CHECK_FAILED", message = "Bot verification failed. Please try again." } });

        // Normalize before lookup — matches normalization applied at registration
        var email = request.Email.Trim().ToLowerInvariant();
        var user  = await db.Users.FirstOrDefaultAsync(u => u.Email == email);

        // Always run BCrypt.Verify to prevent timing attacks.
        // If user is null, we verify against DummyHash (pre-computed, constant-time).
        var hash = user?.PasswordHash ?? DummyHash;
        if (user is null || !BCrypt.Net.BCrypt.Verify(request.Password, hash))
            return Unauthorized(new { error = new { code = "INVALID_CREDENTIALS", message = "Invalid email or password" } });

        var (token, expiresAt) = jwt.GenerateToken(user);
        var refresh = await refreshTokens.IssueAsync(user.Id);
        return Ok(ToAuthResponse(token, expiresAt, user, refresh));
    }

    // Exchange a valid refresh token for a fresh access token (and rotate the refresh token).
    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh([FromBody] Dtos.RefreshRequest body)
    {
        var user = await refreshTokens.ConsumeAsync(body?.RefreshToken ?? "");
        if (user is null)
            return Unauthorized(new { error = new { code = "INVALID_REFRESH", message = "Invalid or expired refresh token" } });

        var (token, expiresAt) = jwt.GenerateToken(user);
        var refresh = await refreshTokens.IssueAsync(user.Id);
        return Ok(ToAuthResponse(token, expiresAt, user, refresh));
    }

    private static AuthResponse ToAuthResponse(string token, DateTimeOffset expiresAt, UserEntity user, string refreshToken) => new()
    {
        Token        = token,
        ExpiresAt    = expiresAt,
        UserId       = user.Id,
        RefreshToken = refreshToken,
        Role         = user.Role switch
        {
            UserRole.Candidate => AuthResponseRole.Candidate,
            UserRole.Company   => AuthResponseRole.Company,
            _                  => AuthResponseRole.Admin,
        },
    };
}
