using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using BildixApi.Models;
using Microsoft.EntityFrameworkCore;

namespace BildixApi.Data;

// Seeds the database with the prototype's demo data (5 companies, 4 schools,
// 6 candidates, 7 job offers + scored matches) plus login accounts for the demo.
// Idempotent: re-running does nothing once the data exists.
//
// Demo credentials (all share the same password):
//   admin@bildyx.fr            (Admin)
//   camille.moreau@mail.fr     (Candidate — Camille Moreau)
//   hello@cortel.io            (Company   — Cortél)
//   password: Bildyx2026!
public static class SeedData
{
    private const string DemoPassword = "Bildyx2026!";

    // Deterministic GUID from a stable key, so foreign keys line up across reseeds.
    private static Guid Id(string key)
    {
        var hash = MD5.HashData(Encoding.UTF8.GetBytes(key));
        return new Guid(hash);
    }

    private static string Json(params string[] items) => JsonSerializer.Serialize(items);

    public static async Task InitializeAsync(BildixDbContext db)
    {
        // Migrations are applied by the host before this runs (Program.cs).
        if (await db.Cities.AnyAsync()) return; // already seeded

        // ── Cities ───────────────────────────────────────────────────────────
        var cities = new[]
        {
            new CityEntity { Id = Id("city:Lyon"), Name = "Lyon", Country = "France", Region = "Auvergne-Rhône-Alpes", Population = 522000, Language = "Français", CostOfLiving = "Modéré", Notes = "Pôle tech & industrie en forte croissance." },
            new CityEntity { Id = Id("city:Paris"), Name = "Paris", Country = "France", Region = "Île-de-France", Population = 2100000, Language = "Français", CostOfLiving = "Élevé", Notes = "Premier bassin d'emploi tech d'Europe continentale." },
            new CityEntity { Id = Id("city:Nantes"), Name = "Nantes", Country = "France", Region = "Pays de la Loire", Population = 320000, Language = "Français", CostOfLiving = "Modéré", Notes = "Écosystème SaaS dynamique." },
            new CityEntity { Id = Id("city:Toulouse"), Name = "Toulouse", Country = "France", Region = "Occitanie", Population = 490000, Language = "Français", CostOfLiving = "Modéré", Notes = "Aéronautique, cloud et deeptech." },
            new CityEntity { Id = Id("city:Bordeaux"), Name = "Bordeaux", Country = "France", Region = "Nouvelle-Aquitaine", Population = 260000, Language = "Français", CostOfLiving = "Modéré", Notes = "HealthTech et qualité de vie." },
            new CityEntity { Id = Id("city:Palaiseau"), Name = "Palaiseau", Country = "France", Region = "Île-de-France", Population = 35000, Language = "Français", CostOfLiving = "Modéré", Notes = "Plateau de Saclay — recherche & grandes écoles." },
        };
        db.Cities.AddRange(cities);

        // ── Companies ────────────────────────────────────────────────────────
        var voltaq = new CompanyEntity { Id = Id("co:voltaq"), Name = "Voltaq", Sector = "Cleantech", Headcount = "240", Location = "Lyon", WebsiteUrl = "https://voltaq.fr", Linkedin = "https://linkedin.com/company/voltaq", Revenue = "45 M€", LogoColor = "#059669", About = "Voltaq conçoit des solutions de stockage d'énergie pour accélérer la transition vers le renouvelable.", ValuesJson = Json("Impact", "Rigueur", "Long terme") };
        var hexane = new CompanyEntity { Id = Id("co:hexane"), Name = "Hexane Studio", Sector = "Design produit", Headcount = "48", Location = "Paris", WebsiteUrl = "https://hexane.studio", Linkedin = "https://linkedin.com/company/hexane", Revenue = "8 M€", LogoColor = "#d97706", About = "Studio de design produit qui accompagne les scale-ups de l'idée au pixel.", ValuesJson = Json("Craft", "Curiosité", "Collaboration") };
        var cortel = new CompanyEntity { Id = Id("co:cortel"), Name = "Cortél", Sector = "SaaS B2B", Headcount = "520", Location = "Nantes", WebsiteUrl = "https://cortel.io", Linkedin = "https://linkedin.com/company/cortel", Revenue = "120 M€", LogoColor = "#2244ec", About = "Plateforme SaaS B2B d'orchestration des opérations pour les ETI et grands comptes.", ValuesJson = Json("Fiabilité", "Transparence", "Ambition") };
        var maelis = new CompanyEntity { Id = Id("co:maelis"), Name = "Maélis Santé", Sector = "HealthTech", Headcount = "130", Location = "Bordeaux", WebsiteUrl = "https://maelis.fr", Linkedin = "https://linkedin.com/company/maelis", Revenue = "22 M€", LogoColor = "#e11d48", About = "Logiciels de coordination des soins pour les établissements de santé.", ValuesJson = Json("Soin", "Sécurité", "Humain") };
        var nuagic = new CompanyEntity { Id = Id("co:nuagic"), Name = "Nuagic", Sector = "Cloud", Headcount = "95", Location = "Toulouse", WebsiteUrl = "https://nuagic.com", Linkedin = "https://linkedin.com/company/nuagic", Revenue = "18 M€", LogoColor = "#0891b2", About = "Infrastructure cloud souveraine et managée pour les entreprises européennes.", ValuesJson = Json("Souveraineté", "Performance", "Sobriété") };
        db.Companies.AddRange(voltaq, hexane, cortel, maelis, nuagic);

        // ── Teams ────────────────────────────────────────────────────────────
        var teamBackend = new TeamEntity { Id = Id("team:cortel-backend"), CompanyId = cortel.Id, Name = "Backend Platform", Size = 14, Description = "Cœur de la plateforme : API, orchestration, fiabilité.", StackJson = Json("Go", "PostgreSQL", "gRPC", "Kubernetes") };
        var teamData = new TeamEntity { Id = Id("team:cortel-data"), CompanyId = cortel.Id, Name = "Data & Analytics", Size = 7, Description = "Pipelines, modélisation et restitution de la donnée produit.", StackJson = Json("SQL", "Python", "dbt", "Looker") };
        var teamDesign = new TeamEntity { Id = Id("team:hexane-design"), CompanyId = hexane.Id, Name = "Design Studio", Size = 9, Description = "Design system, recherche et interfaces produit.", StackJson = Json("Figma", "Design System", "Prototypage") };
        var teamInfra = new TeamEntity { Id = Id("team:voltaq-infra"), CompanyId = voltaq.Id, Name = "Infrastructure", Size = 6, Description = "Plateforme cloud, observabilité et fiabilité.", StackJson = Json("Terraform", "AWS", "CI/CD") };
        db.Teams.AddRange(teamBackend, teamData, teamDesign, teamInfra);

        // ── Schools ──────────────────────────────────────────────────────────
        var insa = new SchoolEntity { Id = Id("sch:insa"), Name = "INSA Lyon", Type = "École d'ingénieurs", City = "Lyon", Field = "Informatique", Notes = "Diplôme d'ingénieur en informatique." };
        var ensci = new SchoolEntity { Id = Id("sch:ensci"), Name = "ENSCI — Les Ateliers", Type = "École de design", City = "Paris", Field = "Design industriel", Notes = "Master en design industriel." };
        var dauphine = new SchoolEntity { Id = Id("sch:dauphine"), Name = "Paris-Dauphine", Type = "Université PSL", City = "Paris", Field = "Économie & Gestion", Notes = "Master économie et gestion." };
        var polytech = new SchoolEntity { Id = Id("sch:polytech"), Name = "École Polytechnique", Type = "Grande École", City = "Palaiseau", Field = "Sciences & Ingénierie", Notes = "Cycle ingénieur Bac+5." };
        db.Schools.AddRange(insa, ensci, dauphine, polytech);

        // ── Skills (reference table) ────────────────────────────────────────
        var skillNames = new[]
        {
            "React", "TypeScript", "Node.js", "PostgreSQL", "GraphQL", "Docker",
            "Figma", "Design System", "Prototypage", "Recherche UX", "UI Motion",
            "SQL", "Python", "dbt", "Looker", "Statistiques",
            "Go", "Kubernetes", "gRPC", "Discovery", "Roadmap", "Analytics",
            "A/B testing", "Terraform", "AWS", "CI/CD", "Observabilité",
        };
        var skills = skillNames.ToDictionary(n => n, n => new SkillEntity { Id = Id("skill:" + n), Name = n });
        db.Skills.AddRange(skills.Values);

        // ── Candidates ───────────────────────────────────────────────────────
        // Tuple: key, first, last, title, color, email, phone, city, availability, expYears,
        //        (skill, isKey)[], experiences (company, role, years ago start/end), education (school, degree)
        var camille = NewCandidate("c1", "Camille", "Moreau", "Développeuse Full-Stack", "#2244ec", "camille.moreau@mail.fr", "06 12 34 56 78", cities[0], Availability.Searching, 6);
        var lucas   = NewCandidate("c2", "Lucas", "Bernard", "Product Designer", "#d97706", "lucas.bernard@mail.fr", "06 98 76 54 32", cities[1], Availability.Unavailable, 7);
        var sarah   = NewCandidate("c3", "Sarah", "Benali", "Data Analyst", "#059669", "sarah.benali@mail.fr", "07 45 67 89 01", cities[2], Availability.Searching, 4);
        var yanis   = NewCandidate("c4", "Yanis", "Khelifi", "Ingénieur Backend", "#7c3aed", "yanis.khelifi@mail.fr", "06 33 22 11 00", cities[3], Availability.Paused, 5);
        var ines    = NewCandidate("c5", "Inès", "Faure", "Product Manager", "#e11d48", "ines.faure@mail.fr", "07 11 22 33 44", cities[1], Availability.Unavailable, 8);
        var thomas  = NewCandidate("c6", "Thomas", "Girard", "DevOps / SRE", "#0891b2", "thomas.girard@mail.fr", "06 55 44 33 22", cities[0], Availability.Searching, 6);
        var candidates = new[] { camille, lucas, sarah, yanis, ines, thomas };
        db.Candidates.AddRange(candidates);

        // Candidate skills (with key flags), stored both as join rows and JSON list.
        AddSkills(db, skills, camille, [("React", true), ("TypeScript", true), ("Node.js", false), ("PostgreSQL", false), ("GraphQL", true), ("Docker", false)]);
        AddSkills(db, skills, lucas, [("Figma", true), ("Design System", true), ("Prototypage", false), ("Recherche UX", false), ("UI Motion", false)]);
        AddSkills(db, skills, sarah, [("SQL", true), ("Python", true), ("dbt", false), ("Looker", false), ("Statistiques", false)]);
        AddSkills(db, skills, yanis, [("Go", true), ("Kubernetes", true), ("gRPC", false), ("PostgreSQL", false)]);
        AddSkills(db, skills, ines, [("Discovery", true), ("Roadmap", false), ("Analytics", false), ("A/B testing", false)]);
        AddSkills(db, skills, thomas, [("Terraform", true), ("AWS", true), ("CI/CD", false), ("Observabilité", false)]);

        // ── Experiences ──────────────────────────────────────────────────────
        db.Experiences.AddRange(
            Exp(camille, voltaq, "Ingénieure logiciel", 2018, 2021),
            Exp(camille, cortel, "Développeuse Full-Stack", 2021, null),
            Exp(lucas, hexane, "Product Designer", 2019, null),
            Exp(sarah, cortel, "Data Analyst", 2020, 2023),
            Exp(sarah, nuagic, "Analyste BI", 2023, null),
            Exp(yanis, nuagic, "Ingénieur Backend", 2020, null),
            Exp(ines, maelis, "Product Manager", 2018, 2022),
            Exp(ines, hexane, "Senior PM", 2022, null),
            Exp(thomas, voltaq, "DevOps Engineer", 2019, null));

        // ── Educations ─────────────────────────────────────────────────────
        db.Educations.AddRange(
            Edu(camille, insa, "Diplôme d'ingénieur — Informatique", 2014, 2019),
            Edu(lucas, ensci, "Master — Design industriel", 2013, 2017),
            Edu(sarah, dauphine, "Master — Économie & Gestion", 2016, 2020),
            Edu(yanis, polytech, "Ingénieur Bac+5", 2014, 2018),
            Edu(ines, dauphine, "Master — Management", 2012, 2016),
            Edu(thomas, insa, "Diplôme d'ingénieur — Informatique", 2013, 2018));

        // ── Job offers ─────────────────────────────────────────────────────
        var j1 = Job("j1", cortel, teamBackend, "Ingénieur Backend Go", ContractType.CDI, "Nantes", "Construire le cœur de plateforme orienté fiabilité et performance.", Json("Go", "PostgreSQL", "gRPC", "Kubernetes"), 70000, 90000);
        var j2 = Job("j2", hexane, teamDesign, "Product Designer Senior", ContractType.CDI, "Paris", "Piloter le design system et la recherche produit.", Json("Figma", "Design System", "Prototypage"), 55000, 70000);
        var j3 = Job("j3", cortel, teamData, "Data Analyst", ContractType.CDI, "Remote", "Modéliser et restituer la donnée produit.", Json("SQL", "Python", "dbt"), 45000, 60000);
        var j4 = Job("j4", cortel, null, "Account Executive", ContractType.CDI, "Paris", "Développer le portefeuille grands comptes.", Json(), 50000, 80000);
        var j5 = Job("j5", voltaq, teamInfra, "DevOps / SRE", ContractType.CDI, "Lyon", "Fiabiliser la plateforme et l'observabilité.", Json("Terraform", "AWS", "CI/CD"), 60000, 80000);
        var j6 = Job("j6", cortel, null, "Chargé de recrutement", ContractType.CDI, "Nantes", "Recruter les talents tech et produit.", Json(), 38000, 48000);
        var j7 = Job("j7", nuagic, null, "Alternant Frontend", ContractType.Alternance, "Remote", "Participer au développement des interfaces.", Json("React", "TypeScript"), null, null);
        db.JobOffers.AddRange(j1, j2, j3, j4, j5, j6, j7);

        // ── Matches (applicants with scores & statuses) ──────────────────────
        // status map: nouveau→Pending, encours→Proposed, retenu→Accepted, ecarte→Rejected
        db.Matches.AddRange(
            Match(yanis, j1, 94, Models.MatchStatus.Pending),
            Match(thomas, j1, 88, Models.MatchStatus.Proposed),
            Match(camille, j1, 81, Models.MatchStatus.Pending),
            Match(sarah, j1, 72, Models.MatchStatus.Rejected),
            Match(lucas, j2, 91, Models.MatchStatus.Proposed),
            Match(ines, j2, 79, Models.MatchStatus.Pending),
            Match(sarah, j3, 95, Models.MatchStatus.Accepted),
            Match(camille, j3, 77, Models.MatchStatus.Pending),
            Match(ines, j3, 70, Models.MatchStatus.Pending),
            Match(thomas, j5, 93, Models.MatchStatus.Pending),
            Match(yanis, j5, 84, Models.MatchStatus.Proposed),
            Match(camille, j7, 80, Models.MatchStatus.Pending));

        // ── Login accounts ───────────────────────────────────────────────────
        var pw = BCrypt.Net.BCrypt.HashPassword(DemoPassword);
        db.Users.AddRange(
            new UserEntity { Id = Id("user:admin"), Email = "admin@bildyx.fr", PasswordHash = pw, Role = UserRole.Admin },
            new UserEntity { Id = Id("user:camille"), Email = camille.Email, PasswordHash = pw, Role = UserRole.Candidate, CandidateId = camille.Id },
            new UserEntity { Id = Id("user:cortel"), Email = "hello@cortel.io", PasswordHash = pw, Role = UserRole.Company, CompanyId = cortel.Id });

        await db.SaveChangesAsync();
    }

    private static CandidateEntity NewCandidate(string key, string first, string last, string title,
        string color, string email, string phone, CityEntity city, Availability avail, int years) => new()
    {
        Id = Id("cand:" + key),
        Name = $"{first} {last}",
        FirstName = first,
        LastName = last,
        Title = title,
        AvatarColor = color,
        Email = email,
        Phone = phone,
        CityId = city.Id,
        Location = $"{city.Name}, {city.Country}",
        Availability = avail,
        ExperienceYears = years,
        Summary = $"{title} basé(e) à {city.Name}, {years} ans d'expérience.",
    };

    private static void AddSkills(BildixDbContext db, Dictionary<string, SkillEntity> skills,
        CandidateEntity candidate, (string name, bool isKey)[] list)
    {
        foreach (var (name, isKey) in list)
            db.CandidateSkills.Add(new CandidateSkillEntity { CandidateId = candidate.Id, SkillId = skills[name].Id, IsKey = isKey });

        candidate.SkillsJson = JsonSerializer.Serialize(list.Select(s => s.name).ToArray());
    }

    private static ExperienceEntity Exp(CandidateEntity c, CompanyEntity co, string role, int start, int? end) => new()
    {
        Id = Id($"exp:{c.Id}:{co.Id}:{role}"),
        CandidateId = c.Id,
        CompanyId = co.Id,
        CompanyName = co.Name,
        Role = role,
        StartDate = new DateOnly(start, 9, 1),
        EndDate = end.HasValue ? new DateOnly(end.Value, 6, 30) : null,
        Summary = $"{role} chez {co.Name}.",
    };

    private static EducationEntity Edu(CandidateEntity c, SchoolEntity s, string degree, int start, int end) => new()
    {
        Id = Id($"edu:{c.Id}:{s.Id}"),
        CandidateId = c.Id,
        SchoolId = s.Id,
        SchoolName = s.Name,
        Degree = degree,
        StartDate = new DateOnly(start, 9, 1),
        EndDate = new DateOnly(end, 6, 30),
    };

    private static JobOfferEntity Job(string key, CompanyEntity co, TeamEntity? team, string title,
        ContractType contract, string location, string description, string stackJson, int? salaryMin, int? salaryMax) => new()
    {
        Id = Id("job:" + key),
        CompanyId = co.Id,
        TeamId = team?.Id,
        Title = title,
        ContractType = contract,
        Location = location,
        Description = description,
        RequiredSkillsJson = stackJson,
        SalaryMin = salaryMin,
        SalaryMax = salaryMax,
        OpenedAt = DateTimeOffset.UtcNow.AddDays(-Random.Shared.Next(3, 90)),
    };

    private static MatchEntity Match(CandidateEntity c, JobOfferEntity j, float score, Models.MatchStatus status) => new()
    {
        Id = Id($"match:{c.Id}:{j.Id}"),
        CandidateId = c.Id,
        JobOfferId = j.Id,
        Score = score,
        Status = status,
    };
}
