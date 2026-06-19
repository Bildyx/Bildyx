using System.ComponentModel.DataAnnotations;

namespace BildixApi.Models;

// A single line of a candidate's work history. Renders as a CompanyCard.
public class ExperienceEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid CandidateId { get; set; }
    public CandidateEntity Candidate { get; set; } = null!;

    // Optional — an experience may reference a company in our DB (so we can render its card)
    // or simply name one that isn't tracked.
    public Guid? CompanyId { get; set; }
    public CompanyEntity? Company { get; set; }

    [MaxLength(200)]
    public string? CompanyName { get; set; }

    [Required, MaxLength(160)]
    public string Role { get; set; } = "";

    public DateOnly? StartDate { get; set; }

    // Null end date = current position.
    public DateOnly? EndDate { get; set; }

    [MaxLength(1000)]
    public string? Summary { get; set; }
}
