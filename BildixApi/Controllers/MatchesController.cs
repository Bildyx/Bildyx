using BildixApi.Data;
using BildixApi.Dtos;
using BildixApi.Models;
using BildixApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

using EntityMatchStatus = BildixApi.Models.MatchStatus;
using DtoMatchStatus    = BildixApi.MatchStatus;

namespace BildixApi.Controllers;

[ApiController]
[Authorize]
[Route("api/v1")]
public class MatchesController(BildixDbContext db, MatchingService matching, IEmailService email) : Microsoft.AspNetCore.Mvc.ControllerBase
{
    [HttpGet("match/candidates/{jobId:guid}")]
    public async Task<ActionResult<ICollection<Match>>> GetTopCandidates(Guid jobId, [FromQuery] int limit = 20)
    {
        // DoS mitigation: always clamp limit. A client sending ?limit=999999 gets 100 rows max.
        var safeLimit = Math.Clamp(limit, 1, 100);

        var jobExists = await db.JobOffers.AnyAsync(j => j.Id == jobId);
        if (!jobExists) return NotFound(Err("NOT_FOUND", "Job offer not found"));

        var matches = await db.Matches
            .Where(m => m.JobOfferId == jobId)
            .OrderByDescending(m => m.Score)
            .Take(safeLimit)
            .ToListAsync();

        return Ok(matches.Select(ToDto).ToList());
    }

    // Inbox listing: applicants for a job, joined with candidate info, filterable.
    [HttpGet("jobs/{jobId:guid}/applicants")]
    public async Task<ActionResult<ICollection<MatchDetailDto>>> GetApplicants(
        Guid jobId, [FromQuery] string? status, [FromQuery] float? minScore)
    {
        if (!await db.JobOffers.AnyAsync(j => j.Id == jobId))
            return NotFound(Err("NOT_FOUND", "Job offer not found"));

        var query = db.Matches.Include(m => m.Candidate).Where(m => m.JobOfferId == jobId);

        if (!string.IsNullOrEmpty(status) && Enum.TryParse<EntityMatchStatus>(status, true, out var st))
            query = query.Where(m => m.Status == st);

        if (minScore.HasValue)
            query = query.Where(m => m.Score >= minScore.Value);

        var matches = await query.OrderByDescending(m => m.Score).ToListAsync();
        return Ok(matches.Select(ToDetailDto).ToList());
    }

    // Inbox stats for a job's sidebar.
    [HttpGet("jobs/{jobId:guid}/inbox-stats")]
    public async Task<ActionResult<InboxStatsDto>> GetInboxStats(Guid jobId)
    {
        if (!await db.JobOffers.AnyAsync(j => j.Id == jobId))
            return NotFound(Err("NOT_FOUND", "Job offer not found"));

        var matches = await db.Matches.Where(m => m.JobOfferId == jobId).ToListAsync();
        return Ok(new InboxStatsDto(
            matches.Count,
            matches.Count(m => m.Status == EntityMatchStatus.Pending),
            matches.Count(m => m.Status == EntityMatchStatus.Proposed),
            matches.Count(m => m.Status == EntityMatchStatus.Accepted),
            matches.Count(m => m.Status == EntityMatchStatus.Rejected)));
    }

    // Create a single match with a computed score.
    [HttpPost("match/{candidateId:guid}/{jobId:guid}")]
    public async Task<ActionResult<Match>> ComputeMatch(Guid candidateId, Guid jobId)
    {
        var candidate = await db.Candidates.FindAsync(candidateId);
        if (candidate is null) return NotFound(Err("NOT_FOUND", "Candidate not found"));

        var job = await db.JobOffers.FindAsync(jobId);
        if (job is null) return NotFound(Err("NOT_FOUND", "Job offer not found"));

        if (await db.Matches.AnyAsync(m => m.CandidateId == candidateId && m.JobOfferId == jobId))
            return Conflict(Err("MATCH_EXISTS", "A match already exists for this candidate and job offer"));

        var match = new MatchEntity
        {
            CandidateId = candidateId,
            JobOfferId  = jobId,
            Score       = matching.Score(candidate, job),
            Status      = EntityMatchStatus.Pending,
        };

        db.Matches.Add(match);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetTopCandidates), new { jobId }, ToDto(match));
    }

    // Bulk: (re)compute scores for every candidate against this job. Upserts matches.
    [HttpPost("jobs/{jobId:guid}/compute-matches")]
    [Authorize(Roles = "Company,Admin")]
    public async Task<ActionResult<ICollection<MatchDetailDto>>> ComputeMatches(Guid jobId)
    {
        var job = await db.JobOffers.FindAsync(jobId);
        if (job is null) return NotFound(Err("NOT_FOUND", "Job offer not found"));

        var candidates = await db.Candidates.ToListAsync();
        var existing = await db.Matches.Where(m => m.JobOfferId == jobId).ToDictionaryAsync(m => m.CandidateId);

        foreach (var candidate in candidates)
        {
            var score = matching.Score(candidate, job);
            if (existing.TryGetValue(candidate.Id, out var match))
            {
                match.Score = score; // refresh score; keep curated status
            }
            else
            {
                db.Matches.Add(new MatchEntity
                {
                    CandidateId = candidate.Id,
                    JobOfferId  = jobId,
                    Score       = score,
                    Status      = EntityMatchStatus.Pending,
                });
            }
        }

        await db.SaveChangesAsync();

        var refreshed = await db.Matches.Include(m => m.Candidate)
            .Where(m => m.JobOfferId == jobId)
            .OrderByDescending(m => m.Score)
            .ToListAsync();
        return Ok(refreshed.Select(ToDetailDto).ToList());
    }

    // Admin shortlist: mark the chosen candidates Proposed for this job, creating
    // a scored match where none exists. These then surface in the company inbox.
    [HttpPost("jobs/{jobId:guid}/propose")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ICollection<MatchDetailDto>>> Propose(Guid jobId, [FromBody] ProposeRequest body)
    {
        var job = await db.JobOffers.FindAsync(jobId);
        if (job is null) return NotFound(Err("NOT_FOUND", "Job offer not found"));

        var ids = body.CandidateIds?.Distinct().ToList() ?? [];
        var candidates = await db.Candidates.Where(c => ids.Contains(c.Id)).ToListAsync();
        var existing = await db.Matches.Where(m => m.JobOfferId == jobId && ids.Contains(m.CandidateId))
            .ToDictionaryAsync(m => m.CandidateId);

        foreach (var candidate in candidates)
        {
            if (existing.TryGetValue(candidate.Id, out var match))
            {
                match.Status = EntityMatchStatus.Proposed;
            }
            else
            {
                db.Matches.Add(new MatchEntity
                {
                    CandidateId = candidate.Id,
                    JobOfferId  = jobId,
                    Score       = matching.Score(candidate, job),
                    Status      = EntityMatchStatus.Proposed,
                });
            }
        }

        await db.SaveChangesAsync();

        // Notify the company that new candidates were proposed (Phase 7.2).
        var companyEmail = await db.Users.Where(u => u.CompanyId == job.CompanyId)
            .Select(u => u.Email).FirstOrDefaultAsync();
        if (companyEmail is not null && candidates.Count > 0)
            await email.SendAsync(companyEmail, $"{candidates.Count} nouveau(x) candidat(s) proposé(s)",
                $"<p>{candidates.Count} candidat(s) ont été proposés pour le poste « {job.Title} ».</p>");

        var proposed = await db.Matches.Include(m => m.Candidate)
            .Where(m => m.JobOfferId == jobId && m.Status == EntityMatchStatus.Proposed)
            .OrderByDescending(m => m.Score).ToListAsync();
        return Ok(proposed.Select(ToDetailDto).ToList());
    }

    // Legacy status setter (Accepted/Rejected via the generated DTO).
    [HttpPatch("match/{id:guid}/status")]
    public async Task<ActionResult<Match>> UpdateStatus(Guid id, [FromBody] UpdateMatchStatusRequest body)
    {
        var match = await db.Matches.FindAsync(id);
        if (match is null) return NotFound(Err("NOT_FOUND", "Match not found"));

        match.Status = body.Status == UpdateMatchStatusRequestStatus.Accepted
            ? EntityMatchStatus.Accepted
            : EntityMatchStatus.Rejected;

        await db.SaveChangesAsync();
        return Ok(ToDto(match));
    }

    // Full status setter — supports Proposed (admin shortlist) in addition to Accept/Reject.
    [HttpPatch("matches/{id:guid}/status")]
    public async Task<ActionResult<MatchDetailDto>> SetStatus(Guid id, [FromBody] SetMatchStatusRequest body)
    {
        if (!Enum.TryParse<EntityMatchStatus>(body.Status, true, out var status))
            return BadRequest(Err("INVALID_STATUS", "Status must be Pending, Proposed, Accepted or Rejected"));

        var match = await db.Matches.Include(m => m.Candidate).FirstOrDefaultAsync(m => m.Id == id);
        if (match is null) return NotFound(Err("NOT_FOUND", "Match not found"));

        match.Status = status;
        await db.SaveChangesAsync();

        // Notify the candidate when they are accepted (Phase 7.2).
        if (status == EntityMatchStatus.Accepted)
        {
            var candidateEmail = await db.Users.Where(u => u.CandidateId == match.CandidateId)
                .Select(u => u.Email).FirstOrDefaultAsync();
            if (candidateEmail is not null)
                await email.SendAsync(candidateEmail, "Votre profil a été retenu",
                    "<p>Bonne nouvelle ! Votre profil a été retenu pour un poste.</p>");
        }

        return Ok(ToDetailDto(match));
    }

    private static MatchDetailDto ToDetailDto(MatchEntity e) => new(
        e.Id, e.JobOfferId, e.CandidateId, e.Candidate?.Name ?? "", e.Candidate?.Title,
        e.Candidate?.Location, e.Candidate?.AvatarColor, e.Score, e.Status.ToString(), e.CreatedAt);

    private static Match ToDto(MatchEntity e) => new()
    {
        Id          = e.Id,
        CandidateId = e.CandidateId,
        JobOfferId  = e.JobOfferId,
        Score       = e.Score,
        Status      = e.Status switch
        {
            EntityMatchStatus.Accepted => DtoMatchStatus.Accepted,
            EntityMatchStatus.Rejected => DtoMatchStatus.Rejected,
            _                          => DtoMatchStatus.Pending,
        },
        CreatedAt = e.CreatedAt,
    };

    private static object Err(string code, string message) =>
        new { error = new { code, message } };
}
