using System.ComponentModel.DataAnnotations;

namespace BildixApi.Models;

public enum ContractType { CDI, CDD, Freelance, Stage, Alternance }

public class JobOfferEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();

    // Foreign key — links this offer to a company
    public Guid CompanyId { get; set; }
    public CompanyEntity Company { get; set; } = null!;

    // Optional — the team this position belongs to.
    public Guid? TeamId { get; set; }
    public TeamEntity? Team { get; set; }

    [Required, MaxLength(200)]
    public string Title { get; set; } = "";

    public string? Description { get; set; }

    // Stored as JSON string, same pattern as CandidateEntity.SkillsJson
    public string RequiredSkillsJson { get; set; } = "[]";

    public ContractType ContractType { get; set; } = ContractType.CDI;

    [MaxLength(200)]
    public string? Location { get; set; }

    public int? SalaryMin { get; set; }
    public int? SalaryMax { get; set; }

    public DateTimeOffset OpenedAt { get; set; } = DateTimeOffset.UtcNow;

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    public ICollection<MatchEntity> Matches { get; set; } = [];
}
