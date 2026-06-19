using System.ComponentModel.DataAnnotations;

namespace BildixApi.Models;

public class CompanyEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required, MaxLength(200)]
    public string Name { get; set; } = "";

    [MaxLength(100)]
    public string? Sector { get; set; }

    [MaxLength(200)]
    public string? Location { get; set; }

    [MaxLength(500)]
    public string? WebsiteUrl { get; set; }

    [MaxLength(500)]
    public string? Linkedin { get; set; }

    // Headcount band or exact count (e.g. "50-200").
    [MaxLength(60)]
    public string? Headcount { get; set; }

    // Revenue label (free-form, e.g. "12 M€").
    [MaxLength(60)]
    public string? Revenue { get; set; }

    [MaxLength(2000)]
    public string? About { get; set; }

    // Key values — stored as JSON string (same pattern as skills/stack).
    public string ValuesJson { get; set; } = "[]";

    // Hex/CSS color for the logo badge.
    [MaxLength(20)]
    public string? LogoColor { get; set; }

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    // Navigation properties
    public ICollection<JobOfferEntity> JobOffers { get; set; } = [];
    public ICollection<TeamEntity> Teams { get; set; } = [];
}
