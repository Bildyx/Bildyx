using BildixApi.Models;
using Microsoft.EntityFrameworkCore;

namespace BildixApi.Data;

// DbContext is the EF Core "gateway" to the database.
// Each DbSet<T> corresponds to one SQL table.
// EF Core reads the entity class definitions to infer the table schema.
public class BildixDbContext(DbContextOptions<BildixDbContext> options) : DbContext(options)
{
    public DbSet<CandidateEntity> Candidates => Set<CandidateEntity>();
    public DbSet<CompanyEntity> Companies => Set<CompanyEntity>();
    public DbSet<JobOfferEntity> JobOffers => Set<JobOfferEntity>();
    public DbSet<MatchEntity> Matches => Set<MatchEntity>();
    public DbSet<UserEntity> Users => Set<UserEntity>();
    public DbSet<CityEntity> Cities => Set<CityEntity>();
    public DbSet<SchoolEntity> Schools => Set<SchoolEntity>();
    public DbSet<ExperienceEntity> Experiences => Set<ExperienceEntity>();
    public DbSet<EducationEntity> Educations => Set<EducationEntity>();
    public DbSet<TeamEntity> Teams => Set<TeamEntity>();
    public DbSet<SkillEntity> Skills => Set<SkillEntity>();
    public DbSet<CandidateSkillEntity> CandidateSkills => Set<CandidateSkillEntity>();
    public DbSet<RefreshTokenEntity> RefreshTokens => Set<RefreshTokenEntity>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Unique constraint: one candidate cannot be matched to the same job twice
        modelBuilder.Entity<MatchEntity>()
            .HasIndex(m => new { m.CandidateId, m.JobOfferId })
            .IsUnique();

        // Store enums as readable strings in the DB, not integers
        modelBuilder.Entity<MatchEntity>()
            .Property(m => m.Status)
            .HasConversion<string>();

        modelBuilder.Entity<UserEntity>()
            .Property(u => u.Role)
            .HasConversion<string>();

        modelBuilder.Entity<CandidateEntity>()
            .Property(c => c.Availability)
            .HasConversion<string>();

        modelBuilder.Entity<JobOfferEntity>()
            .Property(j => j.ContractType)
            .HasConversion<string>();

        // One email = one account
        modelBuilder.Entity<UserEntity>()
            .HasIndex(u => u.Email)
            .IsUnique();

        // Skill names are unique reference values
        modelBuilder.Entity<SkillEntity>()
            .HasIndex(s => s.Name)
            .IsUnique();

        // Composite primary key for the candidate↔skill join
        modelBuilder.Entity<CandidateSkillEntity>()
            .HasKey(cs => new { cs.CandidateId, cs.SkillId });

        // Refresh tokens are looked up by hash; revoke the user's tokens on delete.
        modelBuilder.Entity<RefreshTokenEntity>()
            .HasIndex(r => r.TokenHash);
        modelBuilder.Entity<RefreshTokenEntity>()
            .HasOne(r => r.User).WithMany().HasForeignKey(r => r.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // A candidate may reference a city, but deleting a city must not cascade-delete candidates.
        modelBuilder.Entity<CandidateEntity>()
            .HasOne(c => c.City)
            .WithMany()
            .HasForeignKey(c => c.CityId)
            .OnDelete(DeleteBehavior.SetNull);

        // Experiences/educations belong to a candidate (cascade) but only *reference*
        // a company/school (no cascade — reference data outlives the link).
        modelBuilder.Entity<ExperienceEntity>()
            .HasOne(e => e.Company)
            .WithMany()
            .HasForeignKey(e => e.CompanyId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<EducationEntity>()
            .HasOne(e => e.School)
            .WithMany()
            .HasForeignKey(e => e.SchoolId)
            .OnDelete(DeleteBehavior.SetNull);

        // A job's team is optional and survives team deletion.
        modelBuilder.Entity<JobOfferEntity>()
            .HasOne(j => j.Team)
            .WithMany(t => t.JobOffers)
            .HasForeignKey(j => j.TeamId)
            .OnDelete(DeleteBehavior.SetNull);

        // User↔profile links are optional one-to-one; clearing the profile nulls the FK.
        modelBuilder.Entity<UserEntity>()
            .HasOne(u => u.Candidate)
            .WithMany()
            .HasForeignKey(u => u.CandidateId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<UserEntity>()
            .HasOne(u => u.Company)
            .WithMany()
            .HasForeignKey(u => u.CompanyId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
