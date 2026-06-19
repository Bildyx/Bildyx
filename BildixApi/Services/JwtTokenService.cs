using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BildixApi.Models;
using Microsoft.IdentityModel.Tokens;

namespace BildixApi.Services;

public class JwtTokenService(IConfiguration configuration)
{
    // A "claim" is a key-value pair embedded in the token payload.
    // Standard claims: sub (subject = user id), role, email, exp (expiry).
    // The client can decode and read these without the secret key.
    // The server uses the secret key to verify the signature is authentic.
    public (string token, DateTimeOffset expiresAt) GenerateToken(UserEntity user)
    {
        var secretKey = configuration["Jwt:SecretKey"]!;
        var issuer    = configuration["Jwt:Issuer"]!;
        var audience  = configuration["Jwt:Audience"]!;
        // Short-lived access token; refreshed via /auth/refresh. Default 15 min.
        var minutes   = int.TryParse(configuration["Jwt:ExpirationMinutes"], out var m) ? m : 15;

        var expiresAt = DateTimeOffset.UtcNow.AddMinutes(minutes);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(JwtRegisteredClaimNames.Email, user.Email),
            new(ClaimTypes.Role, user.Role.ToString()),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };
        // Ownership claims — let controllers authorize without a DB lookup.
        if (user.CandidateId is { } cid) claims.Add(new Claim("candidateId", cid.ToString()));
        if (user.CompanyId is { } coid) claims.Add(new Claim("companyId", coid.ToString()));

        var key   = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer:             issuer,
            audience:           audience,
            claims:             claims,
            expires:            expiresAt.UtcDateTime,
            signingCredentials: creds
        );

        return (new JwtSecurityTokenHandler().WriteToken(token), expiresAt);
    }
}
