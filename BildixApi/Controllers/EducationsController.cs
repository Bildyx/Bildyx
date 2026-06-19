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
public class EducationsController(BildixDbContext db) : Microsoft.AspNetCore.Mvc.ControllerBase
{
    [HttpGet("candidates/{candidateId:guid}/educations")]
    public async Task<ActionResult<ICollection<EducationDto>>> GetForCandidate(Guid candidateId)
    {
        if (!await db.Candidates.AnyAsync(c => c.Id == candidateId))
            return NotFound(Err("NOT_FOUND", "Candidate not found"));

        var entities = await db.Educations
            .Where(e => e.CandidateId == candidateId)
            .Include(e => e.School)
            .OrderByDescending(e => e.StartDate)
            .ToListAsync();
        return Ok(entities.Select(e => e.ToDto()).ToList());
    }

    [HttpPost("candidates/{candidateId:guid}/educations")]
    public async Task<ActionResult<EducationDto>> Create(Guid candidateId, [FromBody] UpsertEducationRequest body)
    {
        if (!User.OwnsCandidate(candidateId)) return Forbid();
        if (!await db.Candidates.AnyAsync(c => c.Id == candidateId))
            return NotFound(Err("NOT_FOUND", "Candidate not found"));

        var entity = new EducationEntity
        {
            CandidateId = candidateId, SchoolId = body.SchoolId, SchoolName = body.SchoolName,
            Degree = body.Degree, StartDate = body.StartDate, EndDate = body.EndDate,
        };
        db.Educations.Add(entity);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetForCandidate), new { candidateId }, entity.ToDto());
    }

    [HttpPut("educations/{id:guid}")]
    public async Task<ActionResult<EducationDto>> Update(Guid id, [FromBody] UpsertEducationRequest body)
    {
        var entity = await db.Educations.FindAsync(id);
        if (entity is null) return NotFound(Err("NOT_FOUND", "Education not found"));
        if (!User.OwnsCandidate(entity.CandidateId)) return Forbid();

        entity.SchoolId = body.SchoolId; entity.SchoolName = body.SchoolName;
        entity.Degree = body.Degree; entity.StartDate = body.StartDate; entity.EndDate = body.EndDate;
        await db.SaveChangesAsync();
        return Ok(entity.ToDto());
    }

    [HttpDelete("educations/{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var entity = await db.Educations.FindAsync(id);
        if (entity is null) return NotFound(Err("NOT_FOUND", "Education not found"));
        if (!User.OwnsCandidate(entity.CandidateId)) return Forbid();
        db.Educations.Remove(entity);
        await db.SaveChangesAsync();
        return NoContent();
    }

    private static object Err(string code, string message) => new { error = new { code, message } };
}
