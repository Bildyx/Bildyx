using BildixApi.Data;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace BildixApi.Services;

// Reports healthy only when the database is reachable (Phase 8.1).
public class DbHealthCheck(BildixDbContext db) : IHealthCheck
{
    public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken ct = default)
    {
        try
        {
            return await db.Database.CanConnectAsync(ct)
                ? HealthCheckResult.Healthy()
                : HealthCheckResult.Unhealthy("Database unreachable");
        }
        catch (Exception ex)
        {
            return HealthCheckResult.Unhealthy("Database error", ex);
        }
    }
}
