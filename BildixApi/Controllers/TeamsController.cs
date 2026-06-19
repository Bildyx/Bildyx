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
[Route("api/v1")]
public class TeamsController(BildixDbContext db) : Microsoft.AspNetCore.Mvc.ControllerBase
{
    [HttpGet("companies/{companyId:guid}/teams")]
    public async Task<ActionResult<ICollection<TeamDto>>> GetForCompany(Guid companyId)
    {
        if (!await db.Companies.AnyAsync(c => c.Id == companyId))
            return NotFound(Err("NOT_FOUND", "Company not found"));

        var entities = await db.Teams.Where(t => t.CompanyId == companyId).OrderBy(t => t.Name).ToListAsync();
        return Ok(entities.Select(t => t.ToDto()).ToList());
    }

    [HttpPost("companies/{companyId:guid}/teams")]
    [Authorize(Roles = "Company,Admin")]
    public async Task<ActionResult<TeamDto>> Create(Guid companyId, [FromBody] UpsertTeamRequest body)
    {
        if (!User.OwnsCompany(companyId)) return Forbid();

        if (!await db.Companies.AnyAsync(c => c.Id == companyId))
            return NotFound(Err("NOT_FOUND", "Company not found"));

        var entity = new TeamEntity
        {
            CompanyId = companyId, Name = body.Name, Size = body.Size, Description = body.Description,
            StackJson = JsonSerializer.Serialize(body.Stack ?? []),
        };
        db.Teams.Add(entity);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetForCompany), new { companyId }, entity.ToDto());
    }

    [HttpPut("teams/{id:guid}")]
    [Authorize(Roles = "Company,Admin")]
    public async Task<ActionResult<TeamDto>> Update(Guid id, [FromBody] UpsertTeamRequest body)
    {
        var entity = await db.Teams.FindAsync(id);
        if (entity is null) return NotFound(Err("NOT_FOUND", "Team not found"));
        if (!User.OwnsCompany(entity.CompanyId)) return Forbid();

        entity.Name = body.Name; entity.Size = body.Size; entity.Description = body.Description;
        entity.StackJson = JsonSerializer.Serialize(body.Stack ?? []);
        await db.SaveChangesAsync();
        return Ok(entity.ToDto());
    }

    [HttpDelete("teams/{id:guid}")]
    [Authorize(Roles = "Company,Admin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var entity = await db.Teams.FindAsync(id);
        if (entity is null) return NotFound(Err("NOT_FOUND", "Team not found"));
        if (!User.OwnsCompany(entity.CompanyId)) return Forbid();
        db.Teams.Remove(entity);
        await db.SaveChangesAsync();
        return NoContent();
    }

    private static object Err(string code, string message) => new { error = new { code, message } };
}
