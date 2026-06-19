using BildixApi.Data;
using BildixApi.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BildixApi.Controllers;

// Phase 7.3 — candidate search. Uses LIKE matching (portable to SQLite);
// on PostgreSQL/Supabase this would be upgraded to a tsvector full-text index.
[ApiController]
[Authorize(Roles = "Company,Admin")]
[Route("api/v1/search")]
public class SearchController(BildixDbContext db) : Microsoft.AspNetCore.Mvc.ControllerBase
{
    [HttpGet("candidates")]
    public async Task<ActionResult<ICollection<CandidateProfileDto>>> Candidates(
        [FromQuery] string? q, [FromQuery] int offset = 0, [FromQuery] int limit = 20)
    {
        var query = db.Candidates
            .Include(c => c.CandidateSkills).ThenInclude(cs => cs.Skill)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(q))
        {
            var term = q.Trim();
            query = query.Where(c =>
                c.Name.Contains(term) ||
                (c.Title != null && c.Title.Contains(term)) ||
                (c.Location != null && c.Location.Contains(term)) ||
                c.SkillsJson.Contains(term));
        }

        var (skip, take) = Paging.Clamp(offset, limit);
        var results = await query.OrderBy(c => c.Name).Skip(skip).Take(take).ToListAsync();
        return Ok(results.Select(c => c.ToProfileDto()).ToList());
    }
}
