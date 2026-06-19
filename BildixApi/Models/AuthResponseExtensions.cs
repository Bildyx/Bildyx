using System.Text.Json.Serialization;

namespace BildixApi;

// Adds the refresh token to the NSwag-generated AuthResponse without touching
// the generated file (so re-running NSwag won't clobber it).
public partial class AuthResponse
{
    [JsonPropertyName("refreshToken")]
    public string? RefreshToken { get; set; }
}
