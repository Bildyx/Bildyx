using System.ComponentModel.DataAnnotations;

namespace BildixApi.Dtos;

// Hand-written DTOs for the Phase 2 endpoints. Kept separate from the NSwag-generated
// DTOs (BildixApi namespace) and the EF entities (BildixApi.Models namespace).

// Stable human-readable reference id for InfoCards, e.g. "ENT-000012".
public static class RefId
{
    public static string For(string prefix, Guid id)
    {
        var n = (uint)(BitConverter.ToInt32(id.ToByteArray()) & 0x7fffffff) % 1_000_000;
        return $"{prefix}-{n:000000}";
    }
}

// ── Reference data ──────────────────────────────────────────────────────────
public record CityDto(Guid Id, string Name, string? Country, string? Region,
    int? Population, string? Language, string? CostOfLiving, string? Notes, string RefId);

public record SchoolDto(Guid Id, string Name, string? Type, string? City,
    string? Field, string? Notes, string RefId);

public record UpsertCityRequest([Required, StringLength(120)] string Name, [StringLength(120)] string? Country,
    [StringLength(120)] string? Region, int? Population, [StringLength(80)] string? Language,
    [StringLength(80)] string? CostOfLiving, [StringLength(500)] string? Notes);

public record UpsertSchoolRequest([Required, StringLength(160)] string Name, [StringLength(120)] string? Type,
    [StringLength(120)] string? City, [StringLength(120)] string? Field, [StringLength(500)] string? Notes);

// ── Experiences ─────────────────────────────────────────────────────────────
public record ExperienceDto(Guid Id, Guid CandidateId, Guid? CompanyId, string? CompanyName,
    string Role, DateOnly? StartDate, DateOnly? EndDate, string? Summary);

public record UpsertExperienceRequest(Guid? CompanyId, [StringLength(200)] string? CompanyName,
    [Required, StringLength(160)] string Role, DateOnly? StartDate, DateOnly? EndDate, [StringLength(1000)] string? Summary);

// ── Educations ──────────────────────────────────────────────────────────────
public record EducationDto(Guid Id, Guid CandidateId, Guid? SchoolId, string? SchoolName,
    string Degree, DateOnly? StartDate, DateOnly? EndDate);

public record UpsertEducationRequest(Guid? SchoolId, [StringLength(200)] string? SchoolName,
    [Required, StringLength(160)] string Degree, DateOnly? StartDate, DateOnly? EndDate);

// ── Teams ───────────────────────────────────────────────────────────────────
public record TeamDto(Guid Id, Guid CompanyId, string Name, int? Size,
    string? Description, List<string> Stack);

public record UpsertTeamRequest([Required, StringLength(160)] string Name, [Range(0, 100000)] int? Size,
    [StringLength(1000)] string? Description, List<string>? Stack);

// ── Partial profile updates ───────────────────────────────────────────────
public record PatchCandidateRequest([StringLength(100)] string? Name, [StringLength(80)] string? FirstName,
    [StringLength(80)] string? LastName, [StringLength(160)] string? Title, [StringLength(40)] string? Phone,
    Guid? CityId, [StringLength(200)] string? Location, [StringLength(1000)] string? Summary,
    [StringLength(20)] string? AvatarColor, string? Availability, [Range(0, 60)] int? ExperienceYears, List<string>? Skills);

public record PatchCompanyRequest([StringLength(200)] string? Name, [StringLength(100)] string? Sector,
    [StringLength(200)] string? Location, [StringLength(500)] string? WebsiteUrl, [StringLength(500)] string? Linkedin,
    [StringLength(60)] string? Headcount, [StringLength(60)] string? Revenue,
    [StringLength(2000)] string? About, [StringLength(20)] string? LogoColor, List<string>? Values);

// ── Condensed CV cards ────────────────────────────────────────────────────
public record CompanyCardDto(Guid Id, string Name, string? Sector, string? Headcount,
    string? Location, string? WebsiteUrl, string RefId);

public record CityCardDto(Guid Id, string Name, string? Country, string? Region,
    int? Population, string? Language, string RefId);

public record CandidateCardsDto(List<CompanyCardDto> Companies, List<SchoolDto> Schools, CityCardDto? City);

// ── Current user / profile ────────────────────────────────────────────────
public record SkillDto(string Name, bool IsKey);

public record CandidateProfileDto(Guid Id, string Name, string? FirstName, string? LastName,
    string? Title, string Email, string? Phone, string? Location, Guid? CityId, string? Summary,
    string? AvatarColor, string Availability, int ExperienceYears, List<SkillDto> Skills, string RefId);

public record CompanyProfileDto(Guid Id, string Name, string? Sector, string? Location,
    string? WebsiteUrl, string? Linkedin, string? Headcount, string? Revenue, string? About,
    string? LogoColor, List<string> Values, string RefId);

public record MeDto(Guid UserId, string Email, string Role,
    CandidateProfileDto? Candidate, CompanyProfileDto? Company);

// ── Jobs (richer than the generated JobOffer DTO) ───────────────────────────
public record JobDetailDto(Guid Id, Guid CompanyId, string CompanyName, Guid? TeamId, string? TeamName,
    string Title, string? Description, List<string> Stack, string ContractType, string? Location,
    int? SalaryMin, int? SalaryMax, DateTimeOffset OpenedAt, int ApplicantCount);

public record CreateJobRequest([Required] Guid CompanyId, Guid? TeamId, [Required, StringLength(200)] string Title,
    [StringLength(4000)] string? Description, List<string>? Stack, [StringLength(20)] string? ContractType,
    [StringLength(200)] string? Location, int? SalaryMin, int? SalaryMax);

// ── Matches / applicants (carries the Proposed status the generated DTO lacks) ─
public record MatchDetailDto(Guid Id, Guid JobOfferId, Guid CandidateId, string CandidateName,
    string? CandidateTitle, string? Location, string? AvatarColor, float Score, string Status, DateTimeOffset CreatedAt);

public record SetMatchStatusRequest(string Status);

public record InboxStatsDto(int Total, int Pending, int Proposed, int Accepted, int Rejected);

// Admin shortlists candidates for a job → they appear in the company inbox.
public record ProposeRequest(List<Guid> CandidateIds);

// Body for POST /auth/refresh.
public record RefreshRequest([Required] string RefreshToken);
