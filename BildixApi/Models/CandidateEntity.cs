using System.ComponentModel.DataAnnotations;

namespace BildixApi.Models;

public enum Availability { Searching, Paused, Unavailable }

public class CandidateEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required, MaxLength(100)]
    public string Name { get; set; } = "";

    [MaxLength(80)]
    public string? FirstName { get; set; }

    [MaxLength(80)]
    public string? LastName { get; set; }

    // Job title the candidate is looking for (e.g. "Développeur Full-Stack").
    [MaxLength(160)]
    public string? Title { get; set; }

    [Required, MaxLength(255)]
    public string Email { get; set; } = "";

    [MaxLength(40)]
    public string? Phone { get; set; }

    // EF Core cannot store List<string> natively — stored as JSON string.
    // Deserialized at the service layer, not exposed directly via HTTP.
    public string SkillsJson { get; set; } = "[]";

    [MaxLength(200)]
    public string? Location { get; set; }

    public Guid? CityId { get; set; }
    public CityEntity? City { get; set; }

    [MaxLength(1000)]
    public string? Summary { get; set; }

    // Hex/CSS color for the avatar badge when no image is set.
    [MaxLength(20)]
    public string? AvatarColor { get; set; }

    public Availability Availability { get; set; } = Availability.Searching;

    public int ExperienceYears { get; set; }

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    // Navigation properties
    public ICollection<MatchEntity> Matches { get; set; } = [];
    public ICollection<ExperienceEntity> Experiences { get; set; } = [];
    public ICollection<EducationEntity> Educations { get; set; } = [];
    public ICollection<CandidateSkillEntity> CandidateSkills { get; set; } = [];
}
