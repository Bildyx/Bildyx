using System.Text.Json;
using BildixApi.Models;

namespace BildixApi.Services;

// Computes a 0–100 compatibility score between a candidate and a job offer.
// Weighting: skills overlap is dominant, then location, then experience.
public class MatchingService
{
    private const float SkillsWeight = 70f;
    private const float LocationWeight = 20f;
    private const float ExperienceWeight = 10f;

    public float Score(CandidateEntity candidate, JobOfferEntity job)
    {
        var candidateSkills = Deserialize(candidate.SkillsJson);
        var requiredSkills = Deserialize(job.RequiredSkillsJson);

        // Skills: fraction of required skills the candidate has. Neutral 0.5 when
        // a job lists no specific stack (e.g. sales roles).
        float skillsFraction;
        if (requiredSkills.Count == 0)
        {
            skillsFraction = 0.5f;
        }
        else
        {
            var overlap = requiredSkills.Count(rs =>
                candidateSkills.Any(cs => cs.Equals(rs, StringComparison.OrdinalIgnoreCase)));
            skillsFraction = (float)overlap / requiredSkills.Count;
        }

        // Location: full credit when the job's location is contained in the
        // candidate's location, partial credit for remote roles.
        float locationFraction = 0f;
        if (!string.IsNullOrWhiteSpace(job.Location))
        {
            if (job.Location.Contains("Remote", StringComparison.OrdinalIgnoreCase))
                locationFraction = 0.75f;
            else if (!string.IsNullOrWhiteSpace(candidate.Location) &&
                     candidate.Location.Contains(job.Location, StringComparison.OrdinalIgnoreCase))
                locationFraction = 1f;
        }

        // Experience: caps out at 10 years.
        var experienceFraction = Math.Min(candidate.ExperienceYears, 10) / 10f;

        var score = skillsFraction * SkillsWeight
                  + locationFraction * LocationWeight
                  + experienceFraction * ExperienceWeight;

        return MathF.Round(Math.Clamp(score, 0f, 100f), 1);
    }

    private static List<string> Deserialize(string json) =>
        JsonSerializer.Deserialize<List<string>>(json) ?? [];
}
