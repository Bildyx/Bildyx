using BildixApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BildixApi.Controllers;

// Phase 7.5 — avatar/logo upload. Stored via IStorageService (local disk in dev,
// Supabase Storage in production). Limited to 2 MB, JPG/PNG/WebP.
[ApiController]
[Authorize]
[Route("api/v1/upload")]
public class UploadController(IStorageService storage) : Microsoft.AspNetCore.Mvc.ControllerBase
{
    private const long MaxBytes = 2 * 1024 * 1024;
    private static readonly string[] Allowed = [".jpg", ".jpeg", ".png", ".webp"];

    [HttpPost("avatar")]
    [RequestSizeLimit(MaxBytes)]
    public async Task<IActionResult> UploadAvatar(IFormFile file)
    {
        if (file is null || file.Length == 0) return BadRequest(Err("EMPTY", "No file provided"));
        if (file.Length > MaxBytes) return BadRequest(Err("TOO_LARGE", "Max 2 MB"));

        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!Allowed.Contains(ext)) return BadRequest(Err("BAD_FORMAT", "JPG, PNG or WebP only"));

        await using var stream = file.OpenReadStream();
        var url = await storage.SaveAsync("avatars", file.FileName, stream);
        return Ok(new { url });
    }

    private static object Err(string code, string message) => new { error = new { code, message } };
}
