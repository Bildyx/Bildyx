using MayGraphCards.Configurations;
using MayGraphCards.Enumerations;
using MayGraphCards.Models;
using Microsoft.Extensions.Configuration;

namespace MayGraphCards.Services
{
    public class GenerationPreview
    {
        public int ExistingCount { get; set; }
        public int NewCount { get; set; }
        public int UpdatedCount { get; set; }
        public bool IsConfigured { get; set; }
        public string? ConfigError { get; set; }
        public List<string> UnknownCsvFiles { get; set; } = new();
    }

    public class GenerationProgress
    {
        public bool IsRunning { get; set; }
        public bool IsCompleted { get; set; }
        public string? Error { get; set; }
        public int Total { get; set; }
        public int Done { get; set; }
        public int Generated { get; set; }
        public int Skipped { get; set; }
        public string CurrentCard { get; set; } = "";
    }

    public static class CardGenerationService
    {
        private static GenerationProgress _progress = new();
        private static readonly SemaphoreSlim _lock = new(1, 1);

        public static GenerationProgress GetProgress() => _progress;

        public static async Task<GenerationPreview> GetPreviewAsync(CancellationToken ct = default)
        {
            var (config, error) = LoadConfig();
            if (config == null) return new GenerationPreview { ConfigError = error };

            try
            {
                using R2StorageService? r2 = CreateR2Service(config);

                string outputDir = Path.Combine(AppContext.BaseDirectory, config.OutputDirectory);
                if (r2 == null) Directory.CreateDirectory(outputDir);

                GenerationManifest manifest = r2 != null
                    ? await GenerationManifest.LoadFromR2Async(r2, ct)
                    : new GenerationManifest(outputDir);

                HashSet<string>? r2Keys = r2 != null ? await r2.ListObjectKeysAsync(ct) : null;

                string templateDir = Path.Combine(AppContext.BaseDirectory, "wwwroot", "Templates");
                var csvParser = new CsvParser(config.CsvDelimiter);
                var preview = new GenerationPreview { IsConfigured = true };

                List<string> csvFiles = Directory.EnumerateFiles(
                    Path.Combine(AppContext.BaseDirectory, config.InputDirectory),
                    "*.csv", SearchOption.AllDirectories).ToList();

                foreach (string csvPath in csvFiles)
                {
                    List<CardModel> records;
                    try { records = csvParser.ParseCsv(csvPath); }
                    catch (Exception ex) { preview.UnknownCsvFiles.Add($"{Path.GetFileName(csvPath)} — {ex.Message}"); continue; }
                    if (records.Count == 0) continue;

                    Type modelType = records[0].GetType();
                    string? templatePath = FindTemplate(templateDir, modelType);
                    if (templatePath == null) continue;

                    string templateHash = GenerationManifest.ComputeTemplateHash(templatePath);
                    string csvName = Path.GetFileNameWithoutExtension(csvPath);

                    var versions = records[0] is ExtendableCardModel
                        ? new[] { ExtendableCardGenerationEnum.Shortened, ExtendableCardGenerationEnum.Extended }
                        : new[] { ExtendableCardGenerationEnum.NotExtendable };

                    foreach (var version in versions)
                    {
                        if (version == ExtendableCardGenerationEnum.Shortened)
                            records.ForEach(r => { if (r is ExtendableCardModel e) e.IsExtended = false; });
                        else if (version == ExtendableCardGenerationEnum.Extended)
                            records.ForEach(r => { if (r is ExtendableCardModel e) e.IsExtended = true; });

                        string versionKey = version == ExtendableCardGenerationEnum.NotExtendable
                            ? "default" : version.ToString().ToLower();
                        string versionOutputDir = version == ExtendableCardGenerationEnum.NotExtendable
                            ? Path.Combine(outputDir, csvName)
                            : Path.Combine(outputDir, csvName, versionKey);

                        foreach (var record in records)
                        {
                            string manifestKey = $"{csvName}/{versionKey}/{record.CodeSnakeCase}";
                            string dataHash = GenerationManifest.ComputeRecordHash(record);
                            bool isUpToDate = manifest.IsUpToDate(manifestKey, dataHash, templateHash);

                            if (r2 != null)
                            {
                                string r2Key = $"{csvName}/{versionKey}/{csvName}_{record.CodeSnakeCase}.png";
                                bool existsInR2 = r2Keys!.Contains(r2Key);
                                if (isUpToDate && existsInR2) preview.ExistingCount++;
                                else if (manifest.HasEntry(manifestKey)) preview.UpdatedCount++;
                                else preview.NewCount++;
                            }
                            else
                            {
                                string outputFilePath = Path.Combine(versionOutputDir, $"{csvName}_{record.CodeSnakeCase}.png");
                                if (isUpToDate && File.Exists(outputFilePath)) preview.ExistingCount++;
                                else if (!File.Exists(outputFilePath)) preview.NewCount++;
                                else preview.UpdatedCount++;
                            }
                        }
                    }
                }

                return preview;
            }
            catch (Exception ex)
            {
                return new GenerationPreview { ConfigError = ex.Message };
            }
        }

        public static async Task<bool> StartAsync()
        {
            if (!await _lock.WaitAsync(0)) return false;

            _progress = new GenerationProgress { IsRunning = true };

            _ = Task.Run(async () =>
            {
                try { await RunCoreAsync(); }
                catch (Exception ex) { _progress.Error = ex.Message; }
                finally
                {
                    _progress.IsRunning = false;
                    _progress.IsCompleted = true;
                    _lock.Release();
                }
            });

            return true;
        }

        private static async Task RunCoreAsync()
        {
            var (config, error) = LoadConfig();
            if (config == null) throw new InvalidOperationException(error ?? "Configuration error");

            R2StorageService? r2 = CreateR2Service(config);

            string outputDir = Path.Combine(AppContext.BaseDirectory, config.OutputDirectory);
            if (r2 == null) Directory.CreateDirectory(outputDir);

            GenerationManifest manifest = r2 != null
                ? await GenerationManifest.LoadFromR2Async(r2)
                : new GenerationManifest(outputDir);

            HashSet<string>? r2Keys = r2 != null ? await r2.ListObjectKeysAsync() : null;

            string templateDir = Path.Combine(AppContext.BaseDirectory, "wwwroot", "Templates");
            string baseHref = new Uri(Path.Combine(AppContext.BaseDirectory, "wwwroot") + Path.DirectorySeparatorChar).AbsoluteUri;

            var csvParser = new CsvParser(config.CsvDelimiter);
            var templateRenderer = new TemplateRenderer();
            ImageRenderer? imageRenderer = null;

            try
            {
                List<string> csvFiles = Directory.EnumerateFiles(
                    Path.Combine(AppContext.BaseDirectory, config.InputDirectory),
                    "*.csv", SearchOption.AllDirectories).ToList();

                var batches = new List<(string csvName, List<CardModel> records, string templatePath, ExtendableCardGenerationEnum version, string versionOutputDir)>();

                foreach (string csvPath in csvFiles)
                {
                    List<CardModel> records;
                    try { records = csvParser.ParseCsv(csvPath); }
                    catch { continue; }
                    if (records.Count == 0) continue;

                    Type modelType = records[0].GetType();
                    string? templatePath = FindTemplate(templateDir, modelType);
                    if (templatePath == null) continue;

                    string csvName = Path.GetFileNameWithoutExtension(csvPath);
                    var versions = records[0] is ExtendableCardModel
                        ? new[] { ExtendableCardGenerationEnum.Shortened, ExtendableCardGenerationEnum.Extended }
                        : new[] { ExtendableCardGenerationEnum.NotExtendable };

                    foreach (var version in versions)
                    {
                        string versionKey = version == ExtendableCardGenerationEnum.NotExtendable ? "default" : version.ToString().ToLower();
                        string versionDir = version == ExtendableCardGenerationEnum.NotExtendable
                            ? Path.Combine(outputDir, csvName)
                            : Path.Combine(outputDir, csvName, versionKey);
                        batches.Add((csvName, records, templatePath, version, versionDir));
                    }
                }

                int toGenerate = 0;
                foreach (var (csvName, records, templatePath, version, versionOutputDir) in batches)
                {
                    string templateHash = GenerationManifest.ComputeTemplateHash(templatePath);
                    string versionKey = version == ExtendableCardGenerationEnum.NotExtendable ? "default" : version.ToString().ToLower();
                    if (version == ExtendableCardGenerationEnum.Shortened)
                        records.ForEach(r => { if (r is ExtendableCardModel e) e.IsExtended = false; });
                    else if (version == ExtendableCardGenerationEnum.Extended)
                        records.ForEach(r => { if (r is ExtendableCardModel e) e.IsExtended = true; });
                    foreach (var record in records)
                    {
                        string manifestKey = $"{csvName}/{versionKey}/{record.CodeSnakeCase}";
                        string dataHash = GenerationManifest.ComputeRecordHash(record);
                        bool upToDate = manifest.IsUpToDate(manifestKey, dataHash, templateHash);

                        if (r2 != null)
                        {
                            string r2Key = $"{csvName}/{versionKey}/{csvName}_{record.CodeSnakeCase}.png";
                            if (!upToDate || !r2Keys!.Contains(r2Key)) toGenerate++;
                        }
                        else
                        {
                            string outputFilePath = Path.Combine(versionOutputDir, $"{csvName}_{record.CodeSnakeCase}.png");
                            if (!upToDate || !File.Exists(outputFilePath)) toGenerate++;
                        }
                    }
                }
                _progress.Total = toGenerate;

                if (toGenerate == 0)
                {
                    if (r2 != null) await manifest.SaveToR2Async(r2);
                    else manifest.Save();
                    return;
                }

                _progress.CurrentCard = "Initializing browser (may download Chromium on first run)…";
                imageRenderer = new ImageRenderer(config.BrowserPath);
                await imageRenderer.InitialisationAsync();
                _progress.CurrentCard = "";

                int savedSinceCheckpoint = 0;

                foreach (var (csvName, records, templatePath, version, versionOutputDir) in batches)
                {
                    if (r2 == null) Directory.CreateDirectory(versionOutputDir);

                    string templateHash = GenerationManifest.ComputeTemplateHash(templatePath);
                    string versionKey = version == ExtendableCardGenerationEnum.NotExtendable ? "default" : version.ToString().ToLower();

                    if (version == ExtendableCardGenerationEnum.Shortened)
                        records.ForEach(r => { if (r is ExtendableCardModel e) e.IsExtended = false; });
                    else if (version == ExtendableCardGenerationEnum.Extended)
                        records.ForEach(r => { if (r is ExtendableCardModel e) e.IsExtended = true; });

                    foreach (var record in records)
                    {
                        string manifestKey = $"{csvName}/{versionKey}/{record.CodeSnakeCase}";
                        string dataHash = GenerationManifest.ComputeRecordHash(record);

                        _progress.CurrentCard = $"{csvName} / {record.CodeSnakeCase}";

                        bool skip;
                        if (r2 != null)
                        {
                            string r2Key = $"{csvName}/{versionKey}/{csvName}_{record.CodeSnakeCase}.png";
                            skip = manifest.IsUpToDate(manifestKey, dataHash, templateHash) && r2Keys!.Contains(r2Key);
                        }
                        else
                        {
                            string outputFilePath = Path.Combine(versionOutputDir, $"{csvName}_{record.CodeSnakeCase}.png");
                            skip = manifest.IsUpToDate(manifestKey, dataHash, templateHash) && File.Exists(outputFilePath);
                        }

                        if (skip)
                        {
                            _progress.Skipped++;
                            continue;
                        }

                        record.BaseHref = baseHref;
                        string html = await templateRenderer.RenderTemplateAsync(templatePath, record);

                        if (r2 != null)
                        {
                            _progress.CurrentCard = $"{csvName} / {record.CodeSnakeCase} — rendering…";
                            byte[] pngBytes = await imageRenderer.RenderHtmlToBytesAsync(html);
                            _progress.CurrentCard = $"{csvName} / {record.CodeSnakeCase} — uploading…";
                            string r2Key = $"{csvName}/{versionKey}/{csvName}_{record.CodeSnakeCase}.png";
                            await r2.UploadBytesAsync(r2Key, pngBytes);
                        }
                        else
                        {
                            string outputFilePath = Path.Combine(versionOutputDir, $"{csvName}_{record.CodeSnakeCase}.png");
                            await imageRenderer.RenderHtmlToImageAsync(html, outputFilePath);
                        }

                        manifest.Update(manifestKey, dataHash, templateHash);
                        _progress.Generated++;
                        _progress.Done++;

                        // Checkpoint: save manifest to R2 every 500 generated cards to survive crashes
                        if (r2 != null && ++savedSinceCheckpoint % 500 == 0)
                            await manifest.SaveToR2Async(r2);
                    }
                }

                if (r2 != null)
                    await manifest.SaveToR2Async(r2);
                else
                    manifest.Save();
            }
            finally
            {
                r2?.Dispose();
                if (imageRenderer != null)
                    await imageRenderer.CloseAsync();
            }
        }

        private static R2StorageService? CreateR2Service(AppSettings config)
        {
            var r2 = config.R2;
            if (r2 == null || !r2.Enabled) return null;
            if (string.IsNullOrWhiteSpace(r2.AccountId) ||
                string.IsNullOrWhiteSpace(r2.AccessKeyId) ||
                string.IsNullOrWhiteSpace(r2.SecretAccessKey) ||
                string.IsNullOrWhiteSpace(r2.BucketName))
                return null;
            return new R2StorageService(r2.AccountId, r2.AccessKeyId, r2.SecretAccessKey, r2.BucketName, r2.MaxConcurrentUploads);
        }

        private static (AppSettings? config, string? error) LoadConfig()
        {
            try
            {
                string configPath = Path.Combine(AppContext.BaseDirectory, "appsettings.json");
                var config = new ConfigurationBuilder()
                    .AddJsonFile(configPath)
                    .AddJsonFile(Path.Combine(AppContext.BaseDirectory, "appsettings.Local.json"), optional: true)
                    .Build()
                    .Get<AppSettings>();

                if (config == null) return (null, "appsettings.json is missing or malformed");
                if (string.IsNullOrWhiteSpace(config.InputDirectory)) return (null, "'InputDirectory' is not configured in appsettings.json");
                if (string.IsNullOrWhiteSpace(config.OutputDirectory)) return (null, "'OutputDirectory' is not configured in appsettings.json");
                if (string.IsNullOrWhiteSpace(config.CsvDelimiter)) return (null, "'CsvDelimiter' is not configured in appsettings.json");
                return (config, null);
            }
            catch (Exception ex)
            {
                return (null, ex.Message);
            }
        }

        private static string? FindTemplate(string templateDirectory, Type modelType)
        {
            return Directory.EnumerateFiles(templateDirectory, "*.cshtml", SearchOption.AllDirectories)
                .FirstOrDefault(path =>
                {
                    string? firstLine = File.ReadLines(path).FirstOrDefault()?.Trim();
                    return firstLine == $"@model {modelType.FullName}";
                });
        }
    }
}
