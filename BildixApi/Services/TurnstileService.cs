using System.Text.Json.Serialization;

namespace BildixApi.Services;

public class TurnstileService(HttpClient http, IConfiguration config)
{
    private readonly string? _secretKey = config["Turnstile:SecretKey"];

    // Returns true when Turnstile is not configured (dev/Swagger testing bypass).
    // Returns false when configured but token is missing or rejected.
    public async Task<bool> VerifyAsync(string? token, string? remoteIp = null)
    {
        if (string.IsNullOrWhiteSpace(_secretKey))
            return true; // not configured — skip check (development / Swagger UI)

        if (string.IsNullOrWhiteSpace(token))
            return false;

        var form = new Dictionary<string, string>
        {
            ["secret"]   = _secretKey,
            ["response"] = token,
        };
        if (!string.IsNullOrWhiteSpace(remoteIp))
            form["remoteip"] = remoteIp;

        try
        {
            var response = await http.PostAsync(
                "https://challenges.cloudflare.com/turnstile/v0/siteverify",
                new FormUrlEncodedContent(form));

            if (!response.IsSuccessStatusCode) return false;

            var result = await response.Content.ReadFromJsonAsync<TurnstileResponse>();
            return result?.Success == true;
        }
        catch
        {
            // Network failure — fail closed (reject the request rather than silently allow bots)
            return false;
        }
    }

    private record TurnstileResponse([property: JsonPropertyName("success")] bool Success);
}
