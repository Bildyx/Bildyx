using System.ComponentModel.DataAnnotations;

namespace BildixApi.Models;

// Reference table of skills. Candidates link to these via CandidateSkillEntity.
public class SkillEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required, MaxLength(80)]
    public string Name { get; set; } = "";

    public ICollection<CandidateSkillEntity> CandidateSkills { get; set; } = [];
}
