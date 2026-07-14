using System.Reflection;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using MayGraphCards.Models;

namespace MayGraphCards.Services
{
    public class GenerationManifest
    {
        private readonly String _path;
        private Dictionary<String, ManifestEntry> _entries;

        // Local mode: load from disk
        public GenerationManifest(String outputDir)
        {
            _path = Path.Combine(outputDir, ".manifest.json");
            _entries = LoadFromDisk();
        }

        // R2 mode: use LoadFromR2Async factory
        private GenerationManifest()
        {
            _path = string.Empty;
            _entries = new();
        }

        private Dictionary<String, ManifestEntry> LoadFromDisk()
        {
            if (!File.Exists(_path)) return new();
            try
            {
                String json = File.ReadAllText(_path);
                return JsonSerializer.Deserialize<Dictionary<String, ManifestEntry>>(json) ?? new();
            }
            catch { return new(); }
        }

        public static async Task<GenerationManifest> LoadFromR2Async(R2StorageService r2, CancellationToken ct = default)
        {
            var manifest = new GenerationManifest();
            byte[]? data = await r2.DownloadBytesAsync(".manifest.json", ct);
            if (data != null)
            {
                try
                {
                    string json = Encoding.UTF8.GetString(data);
                    manifest._entries = JsonSerializer.Deserialize<Dictionary<String, ManifestEntry>>(json) ?? new();
                }
                catch { }
            }
            return manifest;
        }

        public Boolean IsUpToDate(String key, String dataHash, String templateHash)
        {
            if (!_entries.TryGetValue(key, out ManifestEntry? entry)) return false;
            return entry.DataHash == dataHash && entry.TemplateHash == templateHash;
        }

        public Boolean HasEntry(String key) => _entries.ContainsKey(key);

        public void Update(String key, String dataHash, String templateHash)
        {
            _entries[key] = new ManifestEntry
            {
                DataHash = dataHash,
                TemplateHash = templateHash,
                GeneratedAt = DateTime.UtcNow
            };
        }

        public void Save()
        {
            if (string.IsNullOrEmpty(_path)) return;
            String json = JsonSerializer.Serialize(_entries, new JsonSerializerOptions { WriteIndented = true });
            File.WriteAllText(_path, json);
        }

        public async Task SaveToR2Async(R2StorageService r2)
        {
            string json = JsonSerializer.Serialize(_entries, new JsonSerializerOptions { WriteIndented = true });
            await r2.UploadBytesAsync(".manifest.json", Encoding.UTF8.GetBytes(json), "application/json");
        }

        public static String ComputeRecordHash(CardModel record)
        {
            // Exclude BaseHref — it is injected at render time and is machine-dependent
            var props = record.GetType()
                .GetProperties(BindingFlags.Public | BindingFlags.Instance)
                .Where(p => p.Name != nameof(CardModel.BaseHref))
                .OrderBy(p => p.Name);

            var sb = new StringBuilder();
            foreach (var prop in props)
                sb.Append($"{prop.Name}={prop.GetValue(record)};");

            return ComputeSha256(sb.ToString());
        }

        public static String ComputeTemplateHash(String templatePath)
        {
            return ComputeSha256(File.ReadAllText(templatePath));
        }

        private static String ComputeSha256(String input)
        {
            Byte[] bytes = SHA256.HashData(Encoding.UTF8.GetBytes(input));
            return Convert.ToHexString(bytes).ToLowerInvariant();
        }
    }

    public class ManifestEntry
    {
        public String DataHash { get; set; } = "";
        public String TemplateHash { get; set; } = "";
        public DateTime GeneratedAt { get; set; }
    }
}
