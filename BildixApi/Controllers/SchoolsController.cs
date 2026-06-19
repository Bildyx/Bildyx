using BildixApi.Data;
using BildixApi.Dtos;
using BildixApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BildixApi.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/schools")]
public class SchoolsController(BildixDbContext db) : Microsoft.AspNetCore.Mvc.ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ICollection<SchoolDto>>> GetAll([FromQuery] int offset = 0, [FromQuery] int limit = 50)
    {
        var (skip, take) = Paging.Clamp(offset, limit);
        var entities = await db.Schools.OrderBy(s => s.Name).Skip(skip).Take(take).ToListAsync();
        return Ok(entities.Select(s => s.ToDto()).ToList());
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<SchoolDto>> GetById(Guid id)
    {
        var entity = await db.Schools.FindAsync(id);
        if (entity is null) return NotFound(Err("NOT_FOUND", "School not found"));
        return Ok(entity.ToDto());
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<SchoolDto>> Create([FromBody] UpsertSchoolRequest body)
    {
        var entity = new SchoolEntity
        {
            Name = body.Name, Type = body.Type, City = body.City, Field = body.Field, Notes = body.Notes,
        };
        db.Schools.Add(entity);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = entity.Id }, entity.ToDto());
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<SchoolDto>> Update(Guid id, [FromBody] UpsertSchoolRequest body)
    {
        var entity = await db.Schools.FindAsync(id);
        if (entity is null) return NotFound(Err("NOT_FOUND", "School not found"));
        entity.Name = body.Name; entity.Type = body.Type; entity.City = body.City;
        entity.Field = body.Field; entity.Notes = body.Notes;
        await db.SaveChangesAsync();
        return Ok(entity.ToDto());
    }

    private static object Err(string code, string message) => new { error = new { code, message } };
}
