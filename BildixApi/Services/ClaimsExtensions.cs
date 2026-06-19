using System.Security.Claims;

namespace BildixApi.Services;

// Convenience readers for the identity claims baked into the JWT.
public static class ClaimsExtensions
{
    public static bool IsAdmin(this ClaimsPrincipal user) => user.IsInRole("Admin");

    public static Guid? UserId(this ClaimsPrincipal user) =>
        Parse(user.FindFirstValue(ClaimTypes.NameIdentifier) ?? user.FindFirstValue("sub"));

    public static Guid? CandidateId(this ClaimsPrincipal user) => Parse(user.FindFirstValue("candidateId"));

    public static Guid? CompanyId(this ClaimsPrincipal user) => Parse(user.FindFirstValue("companyId"));

    // Admins bypass; otherwise the principal must own the candidate profile.
    public static bool OwnsCandidate(this ClaimsPrincipal user, Guid candidateId) =>
        user.IsAdmin() || user.CandidateId() == candidateId;

    public static bool OwnsCompany(this ClaimsPrincipal user, Guid companyId) =>
        user.IsAdmin() || user.CompanyId() == companyId;

    private static Guid? Parse(string? s) => Guid.TryParse(s, out var g) ? g : null;
}
