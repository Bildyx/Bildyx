using System.ComponentModel.DataAnnotations;

namespace BildixApi.Models;

// A long-lived refresh token. Only the SHA-256 hash is stored — the raw value
// lives solely on the client. Rotated on every use (old one revoked).
public class RefreshTokenEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required, MaxLength(128)]
    public string TokenHash { get; set; } = "";

    public Guid UserId { get; set; }
    public UserEntity User { get; set; } = null!;

    public DateTimeOffset ExpiresAt { get; set; }
    public bool Revoked { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}
