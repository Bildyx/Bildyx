using System.Text.Json;
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
[Route("api/v1/candidates")]
public class CandidatesController(BildixDbContext db) : Microsoft.AspNetCore.Mvc.ControllerBase
{
    // BFLA note: only Admins can list all candidates.
    // In the future, candidates should only see their own profile.
    // Companies should see candidates matched to their offers only.
    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ICollection<Candidate>>> GetAll([FromQuery] int offset = 0, [FromQuery] int limit = 50)
    {
        var (skip, take) = Paging.Clamp(offset, limit);
        var entities = await db.Candidates.OrderBy(c => c.Name).Skip(skip).Take(take).ToListAsync();
        return Ok(entities.Select(ToDto).ToList());
    }

    // Only candidates can create a candidate profile (not companies).
    [HttpPost]
    [Authorize(Roles = "Candidate")]
    [Microsoft.AspNetCore.RateLimiting.EnableRateLimiting("create-policy")]
    public async Task<ActionResult<Candidate>> Create([FromBody] CreateCandidateRequest body)
    {
        var entity = ToEntity(body);
        db.Candidates.Add(entity);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = entity.Id }, ToDto(entity));
    }

    // Any authenticated user can read a candidate by ID for now.
    // TODO Phase 2: candidates see only their own; companies see only matched candidates.
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<Candidate>> GetById(Guid id)
    {
        var entity = await db.Candidates.FindAsync(id);
        if (entity is null) return NotFound(Err("NOT_FOUND", "Candidate not found"));
        return Ok(ToDto(entity));
    }

    // Partial update of a candidate profile. Only non-null fields are applied.
    [HttpPatch("{id:guid}")]
    public async Task<ActionResult<CandidateProfileDto>> Patch(Guid id, [FromBody] PatchCandidateRequest body)
    {
        // Ownership: a candidate may only edit their own profile (admins may edit any).
        if (!User.OwnsCandidate(id)) return Forbid();

        var entity = await db.Candidates.Include(c => c.CandidateSkills).ThenInclude(cs => cs.Skill).FirstOrDefaultAsync(c => c.Id == id);
        if (entity is null) return NotFound(Err("NOT_FOUND", "Candidate not found"));

        if (body.Name is not null) entity.Name = body.Name;
        if (body.FirstName is not null) entity.FirstName = body.FirstName;
        if (body.LastName is not null) entity.LastName = body.LastName;
        if (body.Title is not null) entity.Title = body.Title;
        if (body.Phone is not null) entity.Phone = body.Phone;
        if (body.CityId is not null) entity.CityId = body.CityId;
        if (body.Location is not null) entity.Location = body.Location;
        if (body.Summary is not null) entity.Summary = body.Summary;
        if (body.AvatarColor is not null) entity.AvatarColor = body.AvatarColor;
        if (body.ExperienceYears is not null) entity.ExperienceYears = body.ExperienceYears.Value;
        if (body.Availability is not null && Enum.TryParse<Availability>(body.Availability, true, out var av))
            entity.Availability = av;
        if (body.Skills is not null) entity.SkillsJson = JsonSerializer.Serialize(body.Skills);

        await db.SaveChangesAsync();
        return Ok(entity.ToProfileDto());
    }

    // Condensed-CV cards: the companies from this candidate's experiences,
    // the schools from their educations, and their current city.
    [HttpGet("{id:guid}/cards")]
    public async Task<ActionResult<CandidateCardsDto>> GetCards(Guid id)
    {
        var candidate = await db.Candidates.FindAsync(id);
        if (candidate is null) return NotFound(Err("NOT_FOUND", "Candidate not found"));

        var companies = await db.Experiences
            .Where(e => e.CandidateId == id && e.Company != null)
            .Select(e => e.Company!)
            .Distinct()
            .ToListAsync();

        var schools = await db.Educations
            .Where(e => e.CandidateId == id && e.School != null)
            .Select(e => e.School!)
            .Distinct()
            .ToListAsync();

        var city = candidate.CityId is null ? null : await db.Cities.FindAsync(candidate.CityId.Value);

        return Ok(new CandidateCardsDto(
            companies.Select(c => c.ToCardDto()).ToList(),
            schools.Select(s => s.ToDto()).ToList(),
            city?.ToCardDto()));
    }

    // IDOR mitigation: only Admin can delete any candidate.
    // TODO Phase 2: a candidate should be able to delete their own profile only
    // (requires User↔Candidate FK — not yet in the data model).
    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var entity = await db.Candidates.FindAsync(id);
        if (entity is null) return NotFound(Err("NOT_FOUND", "Candidate not found"));
        db.Candidates.Remove(entity);
        await db.SaveChangesAsync();
        return NoContent();
    }

    private static Candidate ToDto(CandidateEntity e) => new()
    {
        Id              = e.Id,
        Name            = e.Name,
        Email           = e.Email,
        Skills          = JsonSerializer.Deserialize<List<string>>(e.SkillsJson) ?? [],
        Location        = e.Location,
        ExperienceYears = e.ExperienceYears,
        CreatedAt       = e.CreatedAt,
    };

    private static CandidateEntity ToEntity(CreateCandidateRequest r) => new()
    {
        Name            = r.Name,
        Email           = r.Email,
        SkillsJson      = JsonSerializer.Serialize(r.Skills ?? []),
        Location        = r.Location,
        ExperienceYears = r.ExperienceYears,
    };

    private static object Err(string code, string message) =>
        new { error = new { code, message } };
}
