namespace BildixApi.Models;

// Join table: which skills a candidate has, and whether each is a "key" skill
// (highlighted on the profile). Composite key (CandidateId, SkillId) set in DbContext.
public class CandidateSkillEntity
{
    public Guid CandidateId { get; set; }
    public CandidateEntity Candidate { get; set; } = null!;

    public Guid SkillId { get; set; }
    public SkillEntity Skill { get; set; } = null!;

    public bool IsKey { get; set; }
}
