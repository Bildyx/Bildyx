using System.Text.Json.Serialization;

namespace BildixApi;

// Extends the NSwag-generated partial class to add Turnstile token.
// Kept separate so re-running NSwag does not overwrite this field.
public partial class LoginRequest
{
    [JsonPropertyName("turnstileToken")]
    public string? TurnstileToken { get; set; }
}
