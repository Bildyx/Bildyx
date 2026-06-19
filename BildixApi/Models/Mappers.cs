using System.Text.Json;
using BildixApi.Models;

namespace BildixApi.Dtos;

// Entity → DTO projections shared across controllers.
public static class Mappers
{
    private static List<string> List(string json) =>
        JsonSerializer.Deserialize<List<string>>(json) ?? [];

    public static CityDto ToDto(this CityEntity e) =>
        new(e.Id, e.Name, e.Country, e.Region, e.Population, e.Language, e.CostOfLiving, e.Notes, RefId.For("CITY", e.Id));

    public static SchoolDto ToDto(this SchoolEntity e) =>
        new(e.Id, e.Name, e.Type, e.City, e.Field, e.Notes, RefId.For("UNI", e.Id));

    public static ExperienceDto ToDto(this ExperienceEntity e) =>
        new(e.Id, e.CandidateId, e.CompanyId, e.CompanyName ?? e.Company?.Name, e.Role, e.StartDate, e.EndDate, e.Summary);

    public static EducationDto ToDto(this EducationEntity e) =>
        new(e.Id, e.CandidateId, e.SchoolId, e.SchoolName ?? e.School?.Name, e.Degree, e.StartDate, e.EndDate);

    public static TeamDto ToDto(this TeamEntity e) =>
        new(e.Id, e.CompanyId, e.Name, e.Size, e.Description, List(e.StackJson));

    public static CompanyCardDto ToCardDto(this CompanyEntity e) =>
        new(e.Id, e.Name, e.Sector, e.Headcount, e.Location, e.WebsiteUrl, RefId.For("ENT", e.Id));

    public static CityCardDto ToCardDto(this CityEntity e) =>
        new(e.Id, e.Name, e.Country, e.Region, e.Population, e.Language, RefId.For("CITY", e.Id));

    public static CompanyProfileDto ToProfileDto(this CompanyEntity e) =>
        new(e.Id, e.Name, e.Sector, e.Location, e.WebsiteUrl, e.Linkedin, e.Headcount, e.Revenue,
            e.About, e.LogoColor, List(e.ValuesJson), RefId.For("ENT", e.Id));

    public static CandidateProfileDto ToProfileDto(this CandidateEntity e)
    {
        var skills = e.CandidateSkills.Count > 0
            ? e.CandidateSkills.Select(cs => new SkillDto(cs.Skill?.Name ?? "", cs.IsKey)).ToList()
            : List(e.SkillsJson).Select(s => new SkillDto(s, false)).ToList();

        return new(e.Id, e.Name, e.FirstName, e.LastName, e.Title, e.Email, e.Phone, e.Location,
            e.CityId, e.Summary, e.AvatarColor, e.Availability.ToString(), e.ExperienceYears, skills,
            RefId.For("CND", e.Id));
    }
}
