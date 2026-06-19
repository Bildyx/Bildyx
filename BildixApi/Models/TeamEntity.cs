using System.ComponentModel.DataAnnotations;

namespace BildixApi.Models;

// A team inside a company. Job offers can be attached to a team.
public class TeamEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid CompanyId { get; set; }
    public CompanyEntity Company { get; set; } = null!;

    [Required, MaxLength(160)]
    public string Name { get; set; } = "";

    public int? Size { get; set; }

    [MaxLength(1000)]
    public string? Description { get; set; }

    // Tech stack — stored as JSON string (same pattern as CandidateEntity.SkillsJson).
    public string StackJson { get; set; } = "[]";

    public ICollection<JobOfferEntity> JobOffers { get; set; } = [];
}
