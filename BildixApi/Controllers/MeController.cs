using System.Security.Claims;
using BildixApi.Data;
using BildixApi.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BildixApi.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/me")]
public class MeController(BildixDbContext db) : Microsoft.AspNetCore.Mvc.ControllerBase
{
    // Returns the profile (candidate or company) tied to the authenticated user.
    [HttpGet]
    public async Task<ActionResult<MeDto>> Get()
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized(Err("INVALID_TOKEN", "Missing user identifier"));

        var user = await db.Users
            .Include(u => u.Candidate).ThenInclude(c => c!.CandidateSkills).ThenInclude(cs => cs.Skill)
            .Include(u => u.Company)
            .FirstOrDefaultAsync(u => u.Id == userId.Value);

        if (user is null) return NotFound(Err("NOT_FOUND", "User not found"));

        return Ok(new MeDto(
            user.Id,
            user.Email,
            user.Role.ToString(),
            user.Candidate?.ToProfileDto(),
            user.Company?.ToProfileDto()));
    }

    private Guid? GetUserId()
    {
        var raw = User.FindFirstValue(ClaimTypes.NameIdentifier)
                  ?? User.FindFirstValue("sub");
        return Guid.TryParse(raw, out var id) ? id : null;
    }

    private static object Err(string code, string message) => new { error = new { code, message } };
}
