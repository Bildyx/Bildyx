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
[Route("api/v1/companies")]
public class CompaniesController(BildixDbContext db) : Microsoft.AspNetCore.Mvc.ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ICollection<Company>>> GetAll([FromQuery] int offset = 0, [FromQuery] int limit = 50)
    {
        var (skip, take) = Paging.Clamp(offset, limit);
        var entities = await db.Companies.OrderBy(c => c.Name).Skip(skip).Take(take).ToListAsync();
        return Ok(entities.Select(ToDto).ToList());
    }

    // Only companies (and admins) can create a company profile.
    [HttpPost]
    [Authorize(Roles = "Company,Admin")]
    [Microsoft.AspNetCore.RateLimiting.EnableRateLimiting("create-policy")]
    public async Task<ActionResult<Company>> Create([FromBody] CreateCompanyRequest body)
    {
        var entity = ToEntity(body);
        db.Companies.Add(entity);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = entity.Id }, ToDto(entity));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<Company>> GetById(Guid id)
    {
        var entity = await db.Companies.FindAsync(id);
        if (entity is null) return NotFound(Err("NOT_FOUND", "Company not found"));
        return Ok(ToDto(entity));
    }

    // Phase 7.4 — analytics computed from real data.
    [HttpGet("{id:guid}/analytics")]
    public async Task<IActionResult> Analytics(Guid id)
    {
        if (!await db.Companies.AnyAsync(c => c.Id == id))
            return NotFound(Err("NOT_FOUND", "Company not found"));

        var jobIds = await db.JobOffers.Where(j => j.CompanyId == id).Select(j => j.Id).ToListAsync();
        var matches = await db.Matches.Where(m => jobIds.Contains(m.JobOfferId)).ToListAsync();
        var accepted = matches.Count(m => m.Status == Models.MatchStatus.Accepted);

        return Ok(new
        {
            openJobs = jobIds.Count,
            totalApplicants = matches.Count,
            proposed = matches.Count(m => m.Status == Models.MatchStatus.Proposed),
            accepted,
            acceptanceRate = matches.Count == 0 ? 0 : Math.Round(100.0 * accepted / matches.Count, 1),
        });
    }

    // Full profile (with the enriched fields the generated Company DTO lacks).
    [HttpGet("{id:guid}/profile")]
    public async Task<ActionResult<CompanyProfileDto>> GetProfile(Guid id)
    {
        var entity = await db.Companies.FindAsync(id);
        if (entity is null) return NotFound(Err("NOT_FOUND", "Company not found"));
        return Ok(entity.ToProfileDto());
    }

    // Partial update. Only non-null fields are applied.
    [HttpPatch("{id:guid}")]
    [Authorize(Roles = "Company,Admin")]
    public async Task<ActionResult<CompanyProfileDto>> Patch(Guid id, [FromBody] PatchCompanyRequest body)
    {
        if (!User.OwnsCompany(id)) return Forbid();

        var entity = await db.Companies.FindAsync(id);
        if (entity is null) return NotFound(Err("NOT_FOUND", "Company not found"));

        if (body.Name is not null) entity.Name = body.Name;
        if (body.Sector is not null) entity.Sector = body.Sector;
        if (body.Location is not null) entity.Location = body.Location;
        if (body.WebsiteUrl is not null) entity.WebsiteUrl = body.WebsiteUrl;
        if (body.Linkedin is not null) entity.Linkedin = body.Linkedin;
        if (body.Headcount is not null) entity.Headcount = body.Headcount;
        if (body.Revenue is not null) entity.Revenue = body.Revenue;
        if (body.About is not null) entity.About = body.About;
        if (body.LogoColor is not null) entity.LogoColor = body.LogoColor;
        if (body.Values is not null) entity.ValuesJson = JsonSerializer.Serialize(body.Values);

        await db.SaveChangesAsync();
        return Ok(entity.ToProfileDto());
    }

    private static Company ToDto(CompanyEntity e) => new()
    {
        Id         = e.Id,
        Name       = e.Name,
        Sector     = e.Sector,
        Location   = e.Location,
        WebsiteUrl = e.WebsiteUrl != null ? new Uri(e.WebsiteUrl) : null,
        CreatedAt  = e.CreatedAt,
    };

    private static CompanyEntity ToEntity(CreateCompanyRequest r) => new()
    {
        Name       = r.Name,
        Sector     = r.Sector,
        Location   = r.Location,
        WebsiteUrl = r.WebsiteUrl?.ToString(),
    };

    private static object Err(string code, string message) =>
        new { error = new { code, message } };
}
