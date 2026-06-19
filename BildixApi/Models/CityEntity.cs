using System.ComponentModel.DataAnnotations;

namespace BildixApi.Models;

// Reference data — where candidates live and where jobs are located.
public class CityEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required, MaxLength(120)]
    public string Name { get; set; } = "";

    [MaxLength(120)]
    public string? Country { get; set; }

    [MaxLength(120)]
    public string? Region { get; set; }

    public int? Population { get; set; }

    [MaxLength(80)]
    public string? Language { get; set; }

    // Free-form index label (e.g. "Élevé", "Modéré") rather than a hard number.
    [MaxLength(80)]
    public string? CostOfLiving { get; set; }

    [MaxLength(500)]
    public string? Notes { get; set; }
}
