using BildixApi.Data;
using BildixApi.Dtos;
using BildixApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BildixApi.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/cities")]
public class CitiesController(BildixDbContext db) : Microsoft.AspNetCore.Mvc.ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ICollection<CityDto>>> GetAll([FromQuery] int offset = 0, [FromQuery] int limit = 50)
    {
        var (skip, take) = Paging.Clamp(offset, limit);
        var entities = await db.Cities.OrderBy(c => c.Name).Skip(skip).Take(take).ToListAsync();
        return Ok(entities.Select(c => c.ToDto()).ToList());
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<CityDto>> GetById(Guid id)
    {
        var entity = await db.Cities.FindAsync(id);
        if (entity is null) return NotFound(Err("NOT_FOUND", "City not found"));
        return Ok(entity.ToDto());
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<CityDto>> Create([FromBody] UpsertCityRequest body)
    {
        var entity = new CityEntity
        {
            Name = body.Name, Country = body.Country, Region = body.Region,
            Population = body.Population, Language = body.Language,
            CostOfLiving = body.CostOfLiving, Notes = body.Notes,
        };
        db.Cities.Add(entity);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = entity.Id }, entity.ToDto());
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<CityDto>> Update(Guid id, [FromBody] UpsertCityRequest body)
    {
        var entity = await db.Cities.FindAsync(id);
        if (entity is null) return NotFound(Err("NOT_FOUND", "City not found"));
        entity.Name = body.Name; entity.Country = body.Country; entity.Region = body.Region;
        entity.Population = body.Population; entity.Language = body.Language;
        entity.CostOfLiving = body.CostOfLiving; entity.Notes = body.Notes;
        await db.SaveChangesAsync();
        return Ok(entity.ToDto());
    }

    private static object Err(string code, string message) => new { error = new { code, message } };
}
