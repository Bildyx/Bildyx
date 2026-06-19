namespace BildixApi.Services;

// Phase 7.5 — blob storage abstraction. LocalStorageService writes to wwwroot
// for dev; swap for a Supabase Storage implementation in production.
public interface IStorageService
{
    // Returns the public URL of the stored object.
    Task<string> SaveAsync(string folder, string originalFileName, Stream content);
}

public class LocalStorageService(IWebHostEnvironment env) : IStorageService
{
    public async Task<string> SaveAsync(string folder, string originalFileName, Stream content)
    {
        var root = env.WebRootPath ?? Path.Combine(AppContext.BaseDirectory, "wwwroot");
        var dir = Path.Combine(root, "uploads", folder);
        Directory.CreateDirectory(dir);

        var name = $"{Guid.NewGuid():N}{Path.GetExtension(originalFileName)}";
        await using var fs = File.Create(Path.Combine(dir, name));
        await content.CopyToAsync(fs);

        return $"/uploads/{folder}/{name}";
    }
}
