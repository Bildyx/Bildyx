using System.ComponentModel.DataAnnotations;

namespace BildixApi.Models;

// Proposed = shortlisted by an admin and sent to the company's inbox,
// awaiting the company's Accept/Reject decision.
public enum MatchStatus { Pending, Proposed, Accepted, Rejected }

public class MatchEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();

    // Foreign keys — a match links exactly one candidate to one job offer
    public Guid CandidateId { get; set; }
    public CandidateEntity Candidate { get; set; } = null!;

    public Guid JobOfferId { get; set; }
    public JobOfferEntity JobOffer { get; set; } = null!;

    // Score computed by the matching algorithm (0.0 – 100.0)
    [Range(0, 100)]
    public float Score { get; set; }

    public MatchStatus Status { get; set; } = MatchStatus.Pending;

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}
