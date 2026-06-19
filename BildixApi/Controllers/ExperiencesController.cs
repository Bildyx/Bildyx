using BildixApi.Data;
using BildixApi.Dtos;
using BildixApi.Models;
using BildixApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BildixApi.Controllers;

[ApiController]
[Authorize]
[Route("api/v1")]
public class ExperiencesController(BildixDbContext db) : Microsoft.AspNetCore.Mvc.ControllerBase
{
    [HttpGet("candidates/{candidateId:guid}/experiences")]
    public async Task<ActionResult<ICollection<ExperienceDto>>> GetForCandidate(Guid candidateId)
    {
        if (!await db.Candidates.AnyAsync(c => c.Id == candidateId))
            return NotFound(Err("NOT_FOUND", "Candidate not found"));

        var entities = await db.Experiences
            .Where(e => e.CandidateId == candidateId)
            .Include(e => e.Company)
            .OrderByDescending(e => e.StartDate)
            .ToListAsync();
        return Ok(entities.Select(e => e.ToDto()).ToList());
    }

    [HttpPost("candidates/{candidateId:guid}/experiences")]
    public async Task<ActionResult<ExperienceDto>> Create(Guid candidateId, [FromBody] UpsertExperienceRequest body)
    {
        if (!User.OwnsCandidate(candidateId)) return Forbid();
        if (!await db.Candidates.AnyAsync(c => c.Id == candidateId))
            return NotFound(Err("NOT_FOUND", "Candidate not found"));

        var entity = new ExperienceEntity
        {
            CandidateId = candidateId, CompanyId = body.CompanyId, CompanyName = body.CompanyName,
            Role = body.Role, StartDate = body.StartDate, EndDate = body.EndDate, Summary = body.Summary,
        };
        db.Experiences.Add(entity);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetForCandidate), new { candidateId }, entity.ToDto());
    }

    [HttpPut("experiences/{id:guid}")]
    public async Task<ActionResult<ExperienceDto>> Update(Guid id, [FromBody] UpsertExperienceRequest body)
    {
        var entity = await db.Experiences.FindAsync(id);
        if (entity is null) return NotFound(Err("NOT_FOUND", "Experience not found"));
        if (!User.OwnsCandidate(entity.CandidateId)) return Forbid();

        entity.CompanyId = body.CompanyId; entity.CompanyName = body.CompanyName;
        entity.Role = body.Role; entity.StartDate = body.StartDate;
        entity.EndDate = body.EndDate; entity.Summary = body.Summary;
        await db.SaveChangesAsync();
        return Ok(entity.ToDto());
    }

    [HttpDelete("experiences/{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var entity = await db.Experiences.FindAsync(id);
        if (entity is null) return NotFound(Err("NOT_FOUND", "Experience not found"));
        if (!User.OwnsCandidate(entity.CandidateId)) return Forbid();
        db.Experiences.Remove(entity);
        await db.SaveChangesAsync();
        return NoContent();
    }

    private static object Err(string code, string message) => new { error = new { code, message } };
}
