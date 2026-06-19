using System.ComponentModel.DataAnnotations;

namespace BildixApi.Models;

public enum UserRole { Candidate, Company, Admin }

public class UserEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required, MaxLength(255)]
    public string Email { get; set; } = "";

    // BCrypt hash — never store plain text passwords
    [Required]
    public string PasswordHash { get; set; } = "";

    public UserRole Role { get; set; } = UserRole.Candidate;

    // Links the auth account to its domain profile. Exactly one is set
    // depending on Role (Admin leaves both null).
    public Guid? CandidateId { get; set; }
    public CandidateEntity? Candidate { get; set; }

    public Guid? CompanyId { get; set; }
    public CompanyEntity? Company { get; set; }

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}
