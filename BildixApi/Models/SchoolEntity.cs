using System.ComponentModel.DataAnnotations;

namespace BildixApi.Models;

// Reference data — schools/universities referenced by candidate educations.
public class SchoolEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required, MaxLength(160)]
    public string Name { get; set; } = "";

    // e.g. "École d'ingénieurs", "Université", "École de commerce".
    [MaxLength(120)]
    public string? Type { get; set; }

    [MaxLength(120)]
    public string? City { get; set; }

    [MaxLength(120)]
    public string? Field { get; set; }

    [MaxLength(500)]
    public string? Notes { get; set; }
}
