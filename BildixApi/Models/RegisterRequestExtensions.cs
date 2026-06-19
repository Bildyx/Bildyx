using System.Text.Json.Serialization;

namespace BildixApi;

// Extends the NSwag-generated partial class to add the Turnstile bot-check token.
// Kept separate so re-running NSwag does not overwrite this field.
public partial class RegisterRequest
{
    [JsonPropertyName("turnstileToken")]
    public string? TurnstileToken { get; set; }

    // Optional profile fields collected at signup. A stub profile is created
    // and linked to the new user; the rest is filled in via PATCH afterwards.
    [JsonPropertyName("name")]
    public string? Name { get; set; }

    // Candidate: sought job title. Company: leave null.
    [JsonPropertyName("title")]
    public string? Title { get; set; }

    // Company: sector. Candidate: leave null.
    [JsonPropertyName("sector")]
    public string? Sector { get; set; }
}
