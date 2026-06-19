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
[Route("api/v1/jobs")]
public class JobsController(BildixDbContext db) : Microsoft.AspNetCore.Mvc.ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ICollection<JobDetailDto>>> GetAll(
        [FromQuery] string? sector,
        [FromQuery] string? location,
        [FromQuery] Guid? companyId,
        [FromQuery] string? contractType,
        [FromQuery] Guid? teamId,
        [FromQuery] string? stack,
        [FromQuery] int offset = 0,
        [FromQuery] int limit = 50)
    {
        var query = db.JobOffers.Include(j => j.Company).Include(j => j.Team).AsQueryable();

        if (companyId.HasValue)
            query = query.Where(j => j.CompanyId == companyId.Value);

        if (teamId.HasValue)
            query = query.Where(j => j.TeamId == teamId.Value);

        if (!string.IsNullOrEmpty(location))
            query = query.Where(j => j.Location != null && j.Location.Contains(location));

        if (!string.IsNullOrEmpty(sector))
            query = query.Where(j => j.Company.Sector != null && j.Company.Sector.Contains(sector));

        if (!string.IsNullOrEmpty(contractType) && Enum.TryParse<ContractType>(contractType, true, out var ct))
            query = query.Where(j => j.ContractType == ct);

        if (!string.IsNullOrEmpty(stack))
            query = query.Where(j => j.RequiredSkillsJson.Contains(stack));

        var (skip, take) = Paging.Clamp(offset, limit);
        var entities = await query.OrderByDescending(j => j.OpenedAt).Skip(skip).Take(take).ToListAsync();

        var ids = entities.Select(e => e.Id).ToList();
        var counts = await db.Matches.Where(m => ids.Contains(m.JobOfferId))
            .GroupBy(m => m.JobOfferId)
            .Select(g => new { g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.Key, x => x.Count);

        return Ok(entities.Select(e => ToDto(e, counts.GetValueOrDefault(e.Id))).ToList());
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<JobDetailDto>> GetById(Guid id)
    {
        var entity = await db.JobOffers.Include(j => j.Company).Include(j => j.Team).FirstOrDefaultAsync(j => j.Id == id);
        if (entity is null) return NotFound(Err("NOT_FOUND", "Job offer not found"));
        var count = await db.Matches.CountAsync(m => m.JobOfferId == id);
        return Ok(ToDto(entity, count));
    }

    // BFLA fix: only companies and admins can post job offers.
    [HttpPost]
    [Authorize(Roles = "Company,Admin")]
    [Microsoft.AspNetCore.RateLimiting.EnableRateLimiting("create-policy")]
    public async Task<ActionResult<JobDetailDto>> Create([FromBody] CreateJobRequest body)
    {
        if (!User.OwnsCompany(body.CompanyId)) return Forbid();

        if (!await db.Companies.AnyAsync(c => c.Id == body.CompanyId))
            return NotFound(Err("NOT_FOUND", "Company not found"));

        var entity = new JobOfferEntity
        {
            CompanyId = body.CompanyId,
            TeamId = body.TeamId,
            Title = body.Title,
            Description = body.Description,
            RequiredSkillsJson = JsonSerializer.Serialize(body.Stack ?? []),
            ContractType = Enum.TryParse<ContractType>(body.ContractType, true, out var ct) ? ct : ContractType.CDI,
            Location = body.Location,
            SalaryMin = body.SalaryMin,
            SalaryMax = body.SalaryMax,
        };
        db.JobOffers.Add(entity);
        await db.SaveChangesAsync();
        await db.Entry(entity).Reference(j => j.Company).LoadAsync();
        if (entity.TeamId is not null) await db.Entry(entity).Reference(j => j.Team).LoadAsync();
        return CreatedAtAction(nameof(GetById), new { id = entity.Id }, ToDto(entity, 0));
    }

    private static JobDetailDto ToDto(JobOfferEntity e, int applicantCount) => new(
        e.Id, e.CompanyId, e.Company?.Name ?? "", e.TeamId, e.Team?.Name,
        e.Title, e.Description,
        JsonSerializer.Deserialize<List<string>>(e.RequiredSkillsJson) ?? [],
        e.ContractType.ToString(), e.Location, e.SalaryMin, e.SalaryMax, e.OpenedAt, applicantCount);

    private static object Err(string code, string message) =>
        new { error = new { code, message } };
}
