using System.ComponentModel.DataAnnotations;

namespace BildixApi.Models;

// A diploma/degree on a candidate's profile. Renders as a UniversityCard.
public class EducationEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid CandidateId { get; set; }
    public CandidateEntity Candidate { get; set; } = null!;

    public Guid? SchoolId { get; set; }
    public SchoolEntity? School { get; set; }

    [MaxLength(200)]
    public string? SchoolName { get; set; }

    [Required, MaxLength(160)]
    public string Degree { get; set; } = "";

    public DateOnly? StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
}
