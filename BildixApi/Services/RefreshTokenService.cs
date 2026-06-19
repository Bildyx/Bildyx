using System.Security.Cryptography;
using BildixApi.Data;
using BildixApi.Models;
using Microsoft.EntityFrameworkCore;

namespace BildixApi.Services;

// Issues, validates and rotates refresh tokens. Raw tokens are returned to the
// client; only their SHA-256 hash is persisted.
public class RefreshTokenService(BildixDbContext db, IConfiguration config)
{
    private int Days => int.TryParse(config["Jwt:RefreshDays"], out var d) ? d : 7;

    public async Task<string> IssueAsync(Guid userId)
    {
        var raw = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32));
        db.RefreshTokens.Add(new RefreshTokenEntity
        {
            TokenHash = Hash(raw),
            UserId    = userId,
            ExpiresAt = DateTimeOffset.UtcNow.AddDays(Days),
        });
        await db.SaveChangesAsync();
        return raw;
    }

    // Validates a raw token, revokes it (rotation), and returns the owning user.
    public async Task<UserEntity?> ConsumeAsync(string rawToken)
    {
        if (string.IsNullOrWhiteSpace(rawToken)) return null;
        var hash = Hash(rawToken);

        var token = await db.RefreshTokens.Include(r => r.User)
            .FirstOrDefaultAsync(r => r.TokenHash == hash);

        if (token is null || token.Revoked || token.ExpiresAt < DateTimeOffset.UtcNow)
            return null;

        token.Revoked = true; // rotate: single-use
        await db.SaveChangesAsync();
        return token.User;
    }

    private static string Hash(string raw)
    {
        var bytes = SHA256.HashData(System.Text.Encoding.UTF8.GetBytes(raw));
        return Convert.ToHexString(bytes);
    }
}
