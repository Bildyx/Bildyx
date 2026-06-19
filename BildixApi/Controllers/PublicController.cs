using BildixApi.Data;
using BildixApi.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BildixApi.Controllers;

// Unauthenticated read-only endpoints powering public share links.
[ApiController]
[AllowAnonymous]
[Route("api/v1/public")]
public class PublicController(BildixDbContext db) : Microsoft.AspNetCore.Mvc.ControllerBase
{
    // Public condensed CV: minimal candidate info + their cards.
    [HttpGet("candidates/{id:guid}")]
    public async Task<IActionResult> GetCandidateProfile(Guid id)
    {
        var candidate = await db.Candidates
            .Include(c => c.CandidateSkills).ThenInclude(cs => cs.Skill)
            .FirstOrDefaultAsync(c => c.Id == id);
        if (candidate is null) return NotFound(new { error = new { code = "NOT_FOUND", message = "Candidate not found" } });

        var companies = await db.Experiences.Where(e => e.CandidateId == id && e.Company != null)
            .Select(e => e.Company!).Distinct().ToListAsync();
        var schools = await db.Educations.Where(e => e.CandidateId == id && e.School != null)
            .Select(e => e.School!).Distinct().ToListAsync();
        var city = candidate.CityId is null ? null : await db.Cities.FindAsync(candidate.CityId.Value);

        // Public payload excludes contact details (email/phone).
        return Ok(new
        {
            candidate = new
            {
                candidate.Id,
                candidate.Name,
                candidate.Title,
                candidate.Location,
                candidate.Summary,
                candidate.AvatarColor,
                RefId = RefId.For("CND", candidate.Id),
            },
            cards = new CandidateCardsDto(
                companies.Select(c => c.ToCardDto()).ToList(),
                schools.Select(s => s.ToDto()).ToList(),
                city?.ToCardDto()),
        });
    }

    // Phase 7.1 — public team profile: team details + parent company card.
    [HttpGet("teams/{id:guid}")]
    public async Task<IActionResult> GetTeam(Guid id)
    {
        var team = await db.Teams.Include(t => t.Company).FirstOrDefaultAsync(t => t.Id == id);
        if (team is null) return NotFound(new { error = new { code = "NOT_FOUND", message = "Team not found" } });

        var openRoles = await db.JobOffers.Where(j => j.TeamId == id).Select(j => j.Title).ToListAsync();
        return Ok(new
        {
            team = team.ToDto(),
            company = team.Company.ToCardDto(),
            openRoles,
        });
    }
}
