using System.Diagnostics;
using System.Reflection;
using System.Text.Json;
using MayGraphCards.Configurations;
using MayGraphCards.Models;
using MayGraphCards.Services;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using BindingFlags = System.Reflection.BindingFlags;

namespace MayGraphCards.Dashboard;

public static class DashboardServer
{
    private const int DashboardPort = 5050;
    private static string _outputDir = "";
    private static string _inputDir = "";
    private static string _csvDelimiter = ";";
    // Pretty-print any folder name: "job-icons" → "Job Icons", "city-banners" → "City Banners"
    private static string IconFolderLabel(string folder) =>
        string.Join(" ", folder.Split('-').Select(w => char.ToUpper(w[0]) + w[1..]));

    // Resolves an image sub-folder path and validates it stays inside wwwroot/Images/
    private static string? ResolveImageFolder(string folder)
    {
        if (string.IsNullOrWhiteSpace(folder) || folder.Contains(".."))
            return null;
        string imagesBase = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "wwwroot", "Images"));
        string resolved   = Path.GetFullPath(Path.Combine(imagesBase, folder));
        return resolved.StartsWith(imagesBase + Path.DirectorySeparatorChar, StringComparison.OrdinalIgnoreCase)
               || resolved.Equals(imagesBase, StringComparison.OrdinalIgnoreCase)
            ? resolved : null;
    }

    public static async Task RunAsync(string[] args)
    {
        // Kill any existing process on the dashboard port so restarts are always clean
        await KillPortAsync(DashboardPort);

        // Resolve output directory from config so card previews can be served
        try
        {
            string configPath = Path.Combine(AppContext.BaseDirectory, "appsettings.json");
            var config = new ConfigurationBuilder()
                .AddJsonFile(configPath)
                .Build()
                .Get<AppSettings>();
            if (config is not null && !string.IsNullOrWhiteSpace(config.OutputDirectory))
                _outputDir = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, config.OutputDirectory));
            if (config is not null && !string.IsNullOrWhiteSpace(config.CsvDelimiter))
                _csvDelimiter = config.CsvDelimiter;
            if (config is not null && !string.IsNullOrWhiteSpace(config.InputDirectory))
                _inputDir = config.InputDirectory;
        }
        catch { /* Dashboard still starts even if config is missing */ }

        var builder = WebApplication.CreateBuilder(args);
        builder.WebHost.UseUrls($"http://localhost:{DashboardPort}");
        builder.Logging.SetMinimumLevel(LogLevel.Warning);
        builder.Environment.WebRootPath = Path.Combine(AppContext.BaseDirectory, "wwwroot");

        var app = builder.Build();
        app.UseStaticFiles();

        // Serve generated card images under /output-cards/
        if (!string.IsNullOrEmpty(_outputDir) && Directory.Exists(_outputDir))
        {
            app.UseStaticFiles(new StaticFileOptions
            {
                FileProvider = new PhysicalFileProvider(_outputDir),
                RequestPath = "/output-cards"
            });
        }

        app.MapGet("/", () => Results.Content(GetDashboardHtml(), "text/html; charset=utf-8"));
        app.MapGet("/health", () => Results.Ok());
        app.MapGet("/api/cards", () => Results.Json(GetCardTypes()));
        app.MapGet("/api/output-cards", () => Results.Json(GetOutputCards()));
        app.MapGet("/api/existing-properties", () => Results.Json(GetExistingProperties()));
        app.MapGet("/api/existing-property-icons", () => Results.Json(GetExistingPropertyIcons()));
        app.MapPost("/api/create-card-type", (CreateCardTypeRequest req, IHostApplicationLifetime lifetime) =>
        {
            var (success, message) = CardTypeCreator.CreateCardType(req);
            if (!success) return Results.Json(new { success, message, restarting = false });
            // Assign to group before restart (groups.json is loaded at runtime, no rebuild needed)
            if (!string.IsNullOrWhiteSpace(req.GroupName))
                AssignTypeToGroup(CardTypeCreator.SanitizePropertyName(req.Name), req.GroupName);
            ScheduleRebuildAndRestart(lifetime);
            return Results.Json(new { success = true, message, restarting = true });
        });

        app.MapDelete("/api/card-type/{name}", (string name, IHostApplicationLifetime lifetime) =>
        {
            var (success, message) = CardTypeCreator.DeleteCardType(name);
            if (!success) return Results.Json(new { success, message, restarting = false });
            DeleteOutputFolderForCardType(name);
            RemoveTypeFromAllGroups(name);
            ScheduleRebuildAndRestart(lifetime);
            return Results.Json(new { success = true, message, restarting = true });
        });

        // ── Groups endpoints ────────────────────────────────────────────────
        app.MapGet("/api/groups", () => Results.Json(LoadGroups()));

        app.MapPost("/api/groups", async (HttpContext ctx) =>
        {
            CreateGroupRequest? body;
            try { body = await System.Text.Json.JsonSerializer.DeserializeAsync<CreateGroupRequest>(ctx.Request.Body,
                      new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true }); }
            catch { return Results.BadRequest(new { success = false, message = "Invalid JSON." }); }
            if (body is null || string.IsNullOrWhiteSpace(body.Name))
                return Results.BadRequest(new { success = false, message = "Name is required." });
            var groups = LoadGroups();
            if (groups.Any(g => string.Equals(g.Name, body.Name, StringComparison.OrdinalIgnoreCase)))
                return Results.Conflict(new { success = false, message = $"Group '{body.Name}' already exists." });
            groups.Add(new CardGroup { Name = body.Name.Trim(), Types = body.Types ?? [] });
            SaveGroups(groups);
            return Results.Json(groups);
        });

        app.MapPut("/api/groups/{name}", async (string name, HttpContext ctx) =>
        {
            UpdateGroupRequest? body;
            try { body = await System.Text.Json.JsonSerializer.DeserializeAsync<UpdateGroupRequest>(ctx.Request.Body,
                      new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true }); }
            catch { return Results.BadRequest(new { success = false, message = "Invalid JSON." }); }
            var groups = LoadGroups();
            var group = groups.FirstOrDefault(g => string.Equals(g.Name, name, StringComparison.OrdinalIgnoreCase));
            if (group is null) return Results.NotFound(new { success = false, message = $"Group '{name}' not found." });
            if (body?.NewName is { Length: > 0 } newName) group.Name = newName.Trim();
            if (body?.Types is not null) group.Types = body.Types;
            if (body?.AddType is { Length: > 0 } add)
            {
                // Move type to this group (remove from others first)
                foreach (var g in groups) if (g != group) g.Types.Remove(add);
                if (!group.Types.Contains(add)) group.Types.Add(add);
            }
            if (body?.RemoveType is { Length: > 0 } rem) group.Types.Remove(rem);
            SaveGroups(groups);
            return Results.Json(groups);
        });

        app.MapDelete("/api/groups/{name}", (string name) =>
        {
            var groups = LoadGroups();
            groups.RemoveAll(g => string.Equals(g.Name, name, StringComparison.OrdinalIgnoreCase));
            SaveGroups(groups);
            return Results.Json(groups);
        });

        app.MapGet("/api/icons", () =>
        {
            string iconsDir = Path.Combine(AppContext.BaseDirectory, "wwwroot", "Images", "icons");
            if (!Directory.Exists(iconsDir)) return Results.Json(Array.Empty<object>());
            var icons = Directory.GetFiles(iconsDir, "*.png")
                .Select(f => new { name = Path.GetFileName(f), url = "/Images/icons/" + Path.GetFileName(f) })
                .OrderBy(i => i.name)
                .ToArray();
            return Results.Json(icons);
        });

        app.MapPost("/api/upload-icon", async (IFormFile file) =>
        {
            if (file is null || file.Length == 0)
                return Results.Json(new { success = false, message = "No file provided." });
            if (!file.FileName.EndsWith(".png", StringComparison.OrdinalIgnoreCase))
                return Results.Json(new { success = false, message = "Only PNG files are accepted." });

            string safeName = Path.GetFileName(file.FileName);
            string outputIconsDir = Path.Combine(AppContext.BaseDirectory, "wwwroot", "Images", "icons");
            string destPath = Path.Combine(outputIconsDir, safeName);

            using (var stream = File.Create(destPath))
                await file.CopyToAsync(stream);

            string? projectRoot = CardTypeCreator.GetProjectRoot();
            if (projectRoot is not null)
            {
                string sourceIconsDir = Path.Combine(projectRoot, "wwwroot", "Images", "icons");
                if (Directory.Exists(sourceIconsDir))
                    File.Copy(destPath, Path.Combine(sourceIconsDir, safeName), overwrite: true);
            }

            return Results.Json(new { success = true, name = safeName, url = "/Images/icons/" + safeName });
        });

        app.MapDelete("/api/icon/{name}", (string name) =>
        {
            if (name.Contains("..") || name.Contains("/") || name.Contains("\\"))
                return Results.BadRequest(new { success = false, message = "Invalid icon name." });

            string iconsDir = Path.Combine(AppContext.BaseDirectory, "wwwroot", "Images", "icons");
            string filePath = Path.Combine(iconsDir, name);

            if (!File.Exists(filePath))
                return Results.NotFound(new { success = false, message = "Icon not found." });

            File.Delete(filePath);

            string? projectRoot = CardTypeCreator.GetProjectRoot();
            if (projectRoot is not null)
            {
                string sourceFilePath = Path.Combine(projectRoot, "wwwroot", "Images", "icons", name);
                if (File.Exists(sourceFilePath))
                    File.Delete(sourceFilePath);
            }

            return Results.Json(new { success = true });
        });

        // ── Icon management (all Images/ sub-folders) ────────────────────────
        app.MapGet("/api/icon-folders", () =>
        {
            string imagesDir = Path.Combine(AppContext.BaseDirectory, "wwwroot", "Images");
            if (!Directory.Exists(imagesDir)) return Results.Json(Array.Empty<object>());

            var folders = Directory.GetDirectories(imagesDir)
                .OrderBy(d => d)
                .Select(dir =>
                {
                    string folder = Path.GetFileName(dir)!;
                    var files = Directory.GetFiles(dir, "*.png").OrderBy(f => f)
                        .Select(f => new { name = Path.GetFileName(f), url = $"/Images/{folder}/{Path.GetFileName(f)}" })
                        .ToArray();
                    return new { folder, label = IconFolderLabel(folder), icons = files };
                });
            return Results.Json(folders);
        });

        app.MapPost("/api/icon-folders/{folder}/upload", async (string folder, IFormFile file) =>
        {
            string? dir = ResolveImageFolder(folder);
            if (dir is null) return Results.BadRequest(new { success = false, message = "Invalid folder." });
            if (file is null || file.Length == 0)
                return Results.Json(new { success = false, message = "No file provided." });
            if (!file.FileName.EndsWith(".png", StringComparison.OrdinalIgnoreCase))
                return Results.Json(new { success = false, message = "Only PNG files are accepted." });

            string safeName = Path.GetFileName(file.FileName);
            Directory.CreateDirectory(dir);
            string destPath = Path.Combine(dir, safeName);

            using (var stream = File.Create(destPath))
                await file.CopyToAsync(stream);

            string? projectRoot = CardTypeCreator.GetProjectRoot();
            if (projectRoot is not null)
            {
                string srcDir = Path.Combine(projectRoot, "wwwroot", "Images", folder);
                if (Directory.Exists(srcDir))
                    File.Copy(destPath, Path.Combine(srcDir, safeName), overwrite: true);
            }

            return Results.Json(new { success = true, name = safeName, url = $"/Images/{folder}/{safeName}" });
        });

        app.MapDelete("/api/icon-folders/{folder}/{name}", (string folder, string name) =>
        {
            string? dir = ResolveImageFolder(folder);
            if (dir is null) return Results.BadRequest(new { success = false, message = "Invalid folder." });
            if (name.Contains("..") || name.Contains('/') || name.Contains('\\'))
                return Results.BadRequest(new { success = false, message = "Invalid file name." });

            string filePath = Path.Combine(dir, name);
            if (!File.Exists(filePath))
                return Results.NotFound(new { success = false, message = "File not found." });

            File.Delete(filePath);
            string? projectRoot = CardTypeCreator.GetProjectRoot();
            if (projectRoot is not null)
            {
                string srcPath = Path.Combine(projectRoot, "wwwroot", "Images", folder, name);
                if (File.Exists(srcPath)) File.Delete(srcPath);
            }
            return Results.Json(new { success = true });
        });

        app.MapPut("/api/icon-folders/{folder}/{name}", (string folder, string name, RenameIconRequest req) =>
        {
            string? dir = ResolveImageFolder(folder);
            if (dir is null) return Results.BadRequest(new { success = false, message = "Invalid folder." });
            if (name.Contains("..") || name.Contains('/') || name.Contains('\\'))
                return Results.BadRequest(new { success = false, message = "Invalid file name." });

            string newName = req.NewName?.Trim() ?? "";
            if (string.IsNullOrEmpty(newName))
                return Results.BadRequest(new { success = false, message = "New name cannot be empty." });
            if (!newName.EndsWith(".png", StringComparison.OrdinalIgnoreCase))
                newName += ".png";
            if (newName.Contains("..") || newName.Contains('/') || newName.Contains('\\'))
                return Results.BadRequest(new { success = false, message = "Invalid new name." });

            string oldPath = Path.Combine(dir, name);
            string newPath = Path.Combine(dir, newName);
            if (!File.Exists(oldPath))
                return Results.NotFound(new { success = false, message = "File not found." });
            if (File.Exists(newPath) && !string.Equals(name, newName, StringComparison.OrdinalIgnoreCase))
                return Results.Conflict(new { success = false, message = $"A file named '{newName}' already exists." });

            File.Move(oldPath, newPath, overwrite: false);
            string? projectRoot = CardTypeCreator.GetProjectRoot();
            if (projectRoot is not null)
            {
                string srcOld = Path.Combine(projectRoot, "wwwroot", "Images", folder, name);
                string srcNew = Path.Combine(projectRoot, "wwwroot", "Images", folder, newName);
                if (File.Exists(srcOld)) File.Move(srcOld, srcNew, overwrite: true);
            }
            return Results.Json(new { success = true, newName, url = $"/Images/{folder}/{newName}" });
        });
        // ── End icon management ───────────────────────────────────────────────

        app.MapGet("/api/card-type/{name}", (string name) =>
        {
            var details = CardTypeCreator.GetCardTypeDetails(name);
            if (details is null) return Results.NotFound();
            return Results.Json(details);
        });

        app.MapPut("/api/card-type/{name}", (string name, ModifyCardTypeRequest req, IHostApplicationLifetime lifetime) =>
        {
            req.OriginalName = name;
            var (success, message) = CardTypeCreator.ModifyCardType(req);
            if (!success) return Results.Json(new { success, message, restarting = false });
            // Rename type in groups if the name changed
            string oldTypeName = CardTypeCreator.SanitizePropertyName(name);
            string newTypeName = CardTypeCreator.SanitizePropertyName(req.NewName);
            if (oldTypeName != newTypeName) RenameTypeInGroups(oldTypeName, newTypeName);
            // Group assignment: null = no change, "" = remove from group, non-empty = assign
            if (req.GroupName is not null)
            {
                if (req.GroupName == "") RemoveTypeFromAllGroups(newTypeName);
                else AssignTypeToGroup(newTypeName, req.GroupName);
            }
            ScheduleRebuildAndRestart(lifetime);
            return Results.Json(new { success = true, message, restarting = true });
        });

        app.MapGet("/api/generate/preview", async (CancellationToken ct) =>
            Results.Json(await CardGenerationService.GetPreviewAsync(ct)));

        app.MapPost("/api/generate/start", async () =>
        {
            bool started = await CardGenerationService.StartAsync();
            return started ? Results.Ok() : Results.Conflict(new { error = "Generation already in progress" });
        });

        app.MapGet("/api/generate/progress", () =>
            Results.Json(CardGenerationService.GetProgress()));

        app.MapPost("/api/restart", (IHostApplicationLifetime lifetime) =>
        {
            string? root = CardTypeCreator.GetProjectRoot();
            if (root is null)
                return Results.Json(new { success = false, message = "Restart is only available in development mode." });
            _ = Task.Run(async () =>
            {
                await Task.Delay(300);
                LaunchDeferredRestart(FindDotnetExecutable(), root);
                lifetime.StopApplication();
            });
            return Results.Json(new { success = true });
        });

        app.Lifetime.ApplicationStarted.Register(() =>
        {
            Console.WriteLine($"Dashboard running at http://localhost:{DashboardPort}");
            Console.WriteLine("Press Ctrl+C to stop.\n");
            if (!args.Contains("--no-browser"))
                Process.Start(new ProcessStartInfo($"http://localhost:{DashboardPort}") { UseShellExecute = true });
        });

        using var csvWatcher = SetupCsvWatcher();
        using var excelWatcher = SetupExcelWatcher(_csvDelimiter);
        await app.RunAsync();
    }

    // In dev mode, CSV source files live in the project's Files/csv/ folder but the app reads
    // from bin/Debug/net9.0/Files/csv/ (copied at build time). This watcher syncs any edit
    // made to the source into the bin folder so the dashboard detects changes immediately.
    private static FileSystemWatcher? SetupCsvWatcher()
    {
        string? projectRoot = CardTypeCreator.GetProjectRoot();
        if (projectRoot is null) return null; // Published mode: CSVs are already in AppContext.BaseDirectory

        string sourceCsvDir = Path.Combine(projectRoot, "Files", "csv");
        string targetCsvDir = Path.Combine(AppContext.BaseDirectory, "Files", "csv");
        if (!Directory.Exists(sourceCsvDir)) return null;
        Directory.CreateDirectory(targetCsvDir);

        void SyncFile(string sourcePath)
        {
            try
            {
                string dest = Path.Combine(targetCsvDir, Path.GetFileName(sourcePath));
                // Brief retry loop: editors sometimes lock the file momentarily after saving
                for (int attempt = 0; attempt < 5; attempt++)
                {
                    try { File.Copy(sourcePath, dest, overwrite: true); return; }
                    catch (IOException) when (attempt < 4) { Thread.Sleep(100); }
                }
            }
            catch { /* ignore — next save attempt will retry */ }
        }

        void DeleteFile(string name)
        {
            try
            {
                string dest = Path.Combine(targetCsvDir, name);
                if (File.Exists(dest)) File.Delete(dest);
            }
            catch { }
        }

        var watcher = new FileSystemWatcher(sourceCsvDir, "*.csv")
        {
            NotifyFilter = NotifyFilters.LastWrite | NotifyFilters.FileName | NotifyFilters.Size,
            IncludeSubdirectories = false,
            EnableRaisingEvents = true
        };

        watcher.Changed += (_, e) => SyncFile(e.FullPath);
        watcher.Created += (_, e) => SyncFile(e.FullPath);
        watcher.Renamed += (_, e) => { DeleteFile(e.OldName ?? ""); SyncFile(e.FullPath); };
        watcher.Deleted += (_, e) => DeleteFile(e.Name ?? "");

        Console.WriteLine($"CSV watcher active: changes to {sourceCsvDir} will be reflected immediately.");
        return watcher;
    }

    // Watches Files/excel/ for .xlsx changes and converts them to CSVs in Files/csv/ automatically.
    // In dev mode the CSV watcher then picks up the new CSV and syncs it to the build output.
    // In published mode both directories live under AppContext.BaseDirectory so no extra sync is needed.
    private static FileSystemWatcher? SetupExcelWatcher(string delimiter)
    {
        string? projectRoot = CardTypeCreator.GetProjectRoot();
        string baseDir = projectRoot ?? AppContext.BaseDirectory;

        string excelDir = Path.Combine(baseDir, "Files", "excel");
        string csvDir   = Path.Combine(baseDir, "Files", "csv");

        if (!Directory.Exists(excelDir)) return null;
        Directory.CreateDirectory(csvDir);

        // Debounce timers: Excel saves fire several events in quick succession.
        var debounceTimers = new Dictionary<string, Timer>(StringComparer.OrdinalIgnoreCase);
        var timerLock = new object();

        void ConvertFile(string excelPath)
        {
            try
            {
                string csvName = Path.GetFileNameWithoutExtension(excelPath) + ".csv";
                string csvPath = Path.Combine(csvDir, csvName);

                for (int attempt = 0; attempt < 5; attempt++)
                {
                    try
                    {
                        ExcelConverterService.ConvertToCsv(excelPath, csvPath, delimiter);
                        Console.WriteLine($"[excel→csv] {Path.GetFileName(excelPath)} → {csvName}");
                        return;
                    }
                    catch (IOException) when (attempt < 4) { Thread.Sleep(200); }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[excel→csv] Error converting {Path.GetFileName(excelPath)}: {ex.Message}");
            }
        }

        void ScheduleConvert(string excelPath)
        {
            lock (timerLock)
            {
                if (debounceTimers.TryGetValue(excelPath, out var existing))
                    existing.Dispose();

                debounceTimers[excelPath] = new Timer(_ =>
                {
                    lock (timerLock) debounceTimers.Remove(excelPath);
                    ConvertFile(excelPath);
                }, null, TimeSpan.FromMilliseconds(600), Timeout.InfiniteTimeSpan);
            }
        }

        // Convert on startup any Excel file whose CSV is missing or older than the Excel file.
        foreach (string xlsx in Directory.EnumerateFiles(excelDir, "*.xlsx"))
        {
            string csv = Path.Combine(csvDir, Path.GetFileNameWithoutExtension(xlsx) + ".csv");
            if (!File.Exists(csv) || File.GetLastWriteTimeUtc(xlsx) > File.GetLastWriteTimeUtc(csv))
                ConvertFile(xlsx);
        }

        var watcher = new FileSystemWatcher(excelDir, "*.xlsx")
        {
            NotifyFilter = NotifyFilters.LastWrite | NotifyFilters.FileName | NotifyFilters.Size,
            IncludeSubdirectories = false,
            EnableRaisingEvents = true
        };

        watcher.Changed += (_, e) => ScheduleConvert(e.FullPath);
        watcher.Created += (_, e) => ScheduleConvert(e.FullPath);
        watcher.Renamed += (_, e) => ScheduleConvert(e.FullPath);
        // Deleted: intentionally not removing the CSV when Excel is deleted.

        Console.WriteLine($"Excel watcher active: .xlsx files saved to {excelDir} will be auto-converted to CSV.");
        return watcher;
    }

    private static async Task KillPortAsync(int port)
    {
        try
        {
            Process? p;
            if (OperatingSystem.IsWindows())
            {
                p = Process.Start(new ProcessStartInfo("cmd.exe",
                    $"/c for /f \"tokens=5\" %a in ('netstat -aon ^| findstr \":{port}\" ^| findstr \"LISTENING\"') do taskkill /f /pid %a")
                {
                    UseShellExecute = false,
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                });
            }
            else
            {
                p = Process.Start(new ProcessStartInfo("/bin/sh",
                    $"-c \"lsof -ti :{port} | xargs kill -9 2>/dev/null\"")
                {
                    UseShellExecute = false,
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                });
            }
            if (p != null) await p.WaitForExitAsync();
            await Task.Delay(600); // Give the OS time to release the port
        }
        catch { /* silently ignore if nothing was on the port */ }
    }

    private static void ScheduleRebuildAndRestart(IHostApplicationLifetime lifetime)
    {
        _ = Task.Run(async () =>
        {
            try
            {
                await Task.Delay(300);
                string? root = CardTypeCreator.GetProjectRoot();
                if (root is null) { Console.WriteLine("[dashboard] ERROR: project root not found."); return; }

                string dotnet = FindDotnetExecutable();

                if (OperatingSystem.IsWindows())
                {
                    // On Windows, the running MayGraphCards.exe holds a file lock that prevents
                    // dotnet build from overwriting it (Win32 error: file in use by another process).
                    // Fix: move the build into the orphan .bat script so it runs AFTER the server
                    // exits and releases all locks. The server always restarts — with the new binary
                    // on success, or with the previous binary if the build fails.
                    Console.WriteLine("[dashboard] Scheduling rebuild and restart...");
                    LaunchDeferredRebuildAndRestart(dotnet, root);
                    lifetime.StopApplication();
                    return;
                }

                // macOS / Linux: build in-process — no file locking issues here.
                // Errors are printed before the server stops so the user can see them.
                var build = new Process
                {
                    StartInfo = new ProcessStartInfo(dotnet, $"build \"{root}\"")
                    {
                        UseShellExecute = false,
                        RedirectStandardOutput = true,
                        RedirectStandardError = true,
                        WorkingDirectory = root,
                    }
                };
                build.Start();

                // Read streams concurrently to prevent pipe buffer deadlock
                var stdoutTask = build.StandardOutput.ReadToEndAsync();
                var stderrTask = build.StandardError.ReadToEndAsync();
                await build.WaitForExitAsync();
                string stdout = await stdoutTask;
                string stderr = await stderrTask;

                if (build.ExitCode != 0)
                {
                    Console.WriteLine("[dashboard] Build FAILED — cannot restart.");
                    foreach (var line in (stdout + "\n" + stderr).Split('\n'))
                        if (line.Contains("error", StringComparison.OrdinalIgnoreCase))
                            Console.WriteLine("  " + line.Trim());
                    return;
                }

                // Write a temp script that sleeps 4s (letting current server release the port)
                // then launches the new dashboard. This script is launched BEFORE StopApplication()
                // so it survives as an orphan process after the current process exits.
                LaunchDeferredRestart(dotnet, root);

                // Stop current server — the script above will outlive this process
                lifetime.StopApplication();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[dashboard] Rebuild task exception: {ex.Message}");
            }
        });
    }

    // Windows-only: runs dotnet build INSIDE the orphan .bat, after the server has stopped.
    // Build output is saved to %TEMP%\mg-build.log for inspection if needed.
    // Always restarts: with the new binary on success, with the old binary on failure.
    private static void LaunchDeferredRebuildAndRestart(string dotnet, string root)
    {
        string runArgs = $"run --no-build --project \"{root}\" -- --dashboard --no-browser";
        string script  = Path.Combine(Path.GetTempPath(), "mg-rebuild-restart.bat");
        string logFile = Path.Combine(Path.GetTempPath(), "mg-build.log");

        File.WriteAllText(script,
            $"@echo off\r\n" +
            $"timeout /t 2 /nobreak > nul\r\n" +
            $"\"{dotnet}\" build \"{root}\" > \"{logFile}\" 2>&1\r\n" +
            $"if %errorlevel% neq 0 (\r\n" +
            $"    echo [dashboard] Build FAILED. Log: {logFile}\r\n" +
            $"    echo [dashboard] Restarting with previous version.\r\n" +
            $")\r\n" +
            $"\"{dotnet}\" {runArgs}\r\n");

        Process.Start(new ProcessStartInfo("cmd.exe", $"/c \"{script}\"")
        {
            UseShellExecute  = true,
            WindowStyle      = ProcessWindowStyle.Hidden,
            WorkingDirectory = root,
        });
    }

    private static void LaunchDeferredRestart(string dotnet, string root)
    {
        string runArgs = $"run --no-build --project \"{root}\" -- --dashboard --no-browser";

        if (OperatingSystem.IsWindows())
        {
            string script = Path.Combine(Path.GetTempPath(), "mg-restart.bat");
            File.WriteAllText(script,
                $"@echo off\r\ntimeout /t 4 /nobreak > nul\r\n\"{dotnet}\" {runArgs}\r\n");
            // UseShellExecute = true is required on Windows to detach the child process from
            // the parent's Job Object. With UseShellExecute = false, Windows kills the child
            // when the parent (ASP.NET Core server) exits via StopApplication(), so the
            // new dashboard never starts. WindowStyle.Hidden replaces CreateNoWindow.
            Process.Start(new ProcessStartInfo("cmd.exe", $"/c \"{script}\"")
            {
                UseShellExecute = true,
                WindowStyle     = ProcessWindowStyle.Hidden,
                WorkingDirectory = root,
            });
        }
        else
        {
            string script = Path.Combine(Path.GetTempPath(), "mg-restart.sh");
            File.WriteAllText(script,
                $"#!/bin/sh\nsleep 4\n\"{dotnet}\" {runArgs}\n");
            Process.Start(new ProcessStartInfo("/bin/sh", script)
            {
                UseShellExecute = false,
                WorkingDirectory = root,
            });
        }
    }

    private static string FindDotnetExecutable()
    {
        // When running via `dotnet run`, the host process itself is dotnet — reuse its path
        string? processPath = Environment.ProcessPath;
        if (processPath is not null &&
            Path.GetFileNameWithoutExtension(processPath).Equals("dotnet", StringComparison.OrdinalIgnoreCase))
            return processPath;

        // Known macOS install locations
        if (OperatingSystem.IsMacOS())
        {
            foreach (string path in new[] { "/usr/local/share/dotnet/dotnet", "/usr/local/bin/dotnet" })
                if (File.Exists(path)) return path;
        }

        // Known Windows install locations
        if (OperatingSystem.IsWindows())
        {
            string win = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), "dotnet", "dotnet.exe");
            if (File.Exists(win)) return win;
        }

        return "dotnet"; // fallback: assume it is in PATH
    }

    private static List<string> GetExistingProperties() =>
        Assembly.GetExecutingAssembly()
            .GetTypes()
            .Where(t => typeof(CardModel).IsAssignableFrom(t) && !t.IsAbstract)
            .SelectMany(t => t.GetProperties(BindingFlags.Public | BindingFlags.Instance | BindingFlags.DeclaredOnly)
                              .Where(p => p.CanWrite)
                              .Select(p => CardTypeCreator.PascalCaseToLabel(p.Name)))
            .Distinct()
            .OrderBy(n => n)
            .ToList();

    private static Dictionary<string, string> GetExistingPropertyIcons()
    {
        var merged = new Dictionary<string, string>(StringComparer.Ordinal);
        var typeNames = Assembly.GetExecutingAssembly()
            .GetTypes()
            .Where(t => typeof(CardModel).IsAssignableFrom(t) && !t.IsAbstract)
            .Select(t => t.Name.Replace("CardModel", ""));
        foreach (string typeName in typeNames)
        {
            var details = CardTypeCreator.GetCardTypeDetails(typeName);
            if (details is null) continue;
            foreach (var (prop, icon) in details.Icons)
            {
                string displayName = CardTypeCreator.PascalCaseToLabel(prop);
                if (!merged.ContainsKey(displayName))
                    merged[displayName] = icon;
            }
        }
        return merged;
    }

    private static List<CardTypeInfo> GetCardTypes()
    {
        var nullability = new NullabilityInfoContext();

        return Assembly.GetExecutingAssembly()
            .GetTypes()
            .Where(t => typeof(CardModel).IsAssignableFrom(t) && !t.IsAbstract)
            .OrderBy(t => t.Name)
            .Select(t =>
            {
                string name = t.Name.Replace("CardModel", "");
                bool isExtendable = typeof(ExtendableCardModel).IsAssignableFrom(t);
                var (shortImg, extImg) = FindOutputImages(name, isExtendable);
                return new CardTypeInfo
                {
                    Name = name,
                    DisplayName = CardTypeCreator.PascalCaseToLabel(name),
                    IsExtendable = isExtendable,
                    MockupImageShort = shortImg,
                    MockupImageExtended = extImg,
                    ExpectedCsvFilename = CardTypeCreator.ToKebabCase(name) + ".csv",
                    Properties = t
                        .GetProperties(BindingFlags.Public | BindingFlags.Instance | BindingFlags.DeclaredOnly)
                        .Where(p => p.CanWrite)
                        .Select(p => new CardProperty
                        {
                            Name = p.Name,
                            DisplayName = CardTypeCreator.PascalCaseToLabel(p.Name),
                            IsOptional = nullability.Create(p).WriteState == NullabilityState.Nullable
                        })
                        .ToList()
                };
            })
            .ToList();
    }

    private static List<OutputCardTypeInfo> GetOutputCards()
    {
        if (string.IsNullOrEmpty(_outputDir) || !Directory.Exists(_outputDir))
            return [];

        var namesByType = BuildCardNameLookup();
        var result = new List<OutputCardTypeInfo>();

        foreach (string typeDir in Directory.GetDirectories(_outputDir).OrderBy(d => d))
        {
            string typeName = Path.GetFileName(typeDir)!;
            namesByType.TryGetValue(typeName, out var codeToName);

            bool isExtendable = Directory.Exists(Path.Combine(typeDir, "shortened"))
                             && Directory.Exists(Path.Combine(typeDir, "extended"));

            var cards = new List<OutputCardInfo>();

            if (isExtendable)
            {
                string shortDir = Path.Combine(typeDir, "shortened");
                string extDir   = Path.Combine(typeDir, "extended");
                var shortFiles  = Directory.GetFiles(shortDir, "*.png").OrderBy(f => f).ToList();

                foreach (string shortFile in shortFiles)
                {
                    string fileName = Path.GetFileName(shortFile);
                    string code = ExtractCode(typeName, fileName);
                    string extFile = Path.Combine(extDir, fileName);

                    cards.Add(new OutputCardInfo
                    {
                        Code          = code,
                        SerialDisplay = CodeToSerial(code),
                        Name          = codeToName?.GetValueOrDefault(code),
                        Path          = $"/output-cards/{typeName}/shortened/{fileName}",
                        ExtendedPath  = File.Exists(extFile) ? $"/output-cards/{typeName}/extended/{fileName}" : null
                    });
                }
            }
            else
            {
                foreach (string file in Directory.GetFiles(typeDir, "*.png").OrderBy(f => f))
                {
                    string fileName = Path.GetFileName(file);
                    string code = ExtractCode(typeName, fileName);
                    cards.Add(new OutputCardInfo
                    {
                        Code          = code,
                        SerialDisplay = CodeToSerial(code),
                        Name          = codeToName?.GetValueOrDefault(code),
                        Path          = $"/output-cards/{typeName}/{fileName}",
                        ExtendedPath  = null
                    });
                }
            }

            if (cards.Count > 0)
            {
                int extPngCount = 0;
                if (isExtendable)
                {
                    string extDir = Path.Combine(typeDir, "extended");
                    if (Directory.Exists(extDir))
                        extPngCount = Directory.GetFiles(extDir, "*.png").Length;
                }
                result.Add(new OutputCardTypeInfo
                {
                    Type          = typeName,
                    IsExtendable  = isExtendable,
                    Cards         = cards,
                    TotalPngCount = cards.Count + extPngCount
                });
            }
        }

        return result;
    }

    // Returns csvStem → (codeSnakeCase → displayName) for all parseable CSVs.
    private static Dictionary<string, Dictionary<string, string>> BuildCardNameLookup()
    {
        var result = new Dictionary<string, Dictionary<string, string>>(StringComparer.OrdinalIgnoreCase);
        if (string.IsNullOrEmpty(_inputDir)) return result;

        string inputDir = Path.Combine(AppContext.BaseDirectory, _inputDir);
        if (!Directory.Exists(inputDir)) return result;

        var csvParser = new CsvParser(_csvDelimiter);
        foreach (string csvPath in Directory.EnumerateFiles(inputDir, "*.csv", SearchOption.AllDirectories))
        {
            try
            {
                var records = csvParser.ParseCsv(csvPath);
                if (records.Count == 0) continue;
                var map = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
                foreach (var record in records)
                {
                    string? name = GetTitlePropertyValue(record);
                    if (name != null) map[record.CodeSnakeCase] = name;
                }
                result[Path.GetFileNameWithoutExtension(csvPath)] = map;
            }
            catch { /* skip unparseable CSVs */ }
        }
        return result;
    }

    // Returns the value of the "title" property: first property whose name contains "Name",
    // or first non-SerialNumber property — mirrors the template title selection in GenerateTemplate().
    private static string? GetTitlePropertyValue(CardModel record)
    {
        var props = record.GetType()
            .GetProperties(BindingFlags.Public | BindingFlags.Instance | BindingFlags.DeclaredOnly)
            .Where(p => p.CanRead && p.CanWrite)
            .ToList();
        var nameProp = props.FirstOrDefault(p => p.Name.Contains("Name", StringComparison.OrdinalIgnoreCase));
        if (nameProp != null) return nameProp.GetValue(record) as string;
        return props.FirstOrDefault(p => p.Name != "SerialNumber")?.GetValue(record) as string;
    }

    // "certifications_cer_000001.png" → "cer_000001"
    private static string ExtractCode(string typeName, string fileName)
    {
        string stem = Path.GetFileNameWithoutExtension(fileName);
        string prefix = typeName + "_";
        return stem.StartsWith(prefix, StringComparison.OrdinalIgnoreCase) ? stem[prefix.Length..] : stem;
    }

    // "cer_000001" → "CER-000001"
    private static string CodeToSerial(string code)
    {
        int idx = code.IndexOf('_');
        return idx < 0 ? code.ToUpper() : code[..idx].ToUpper() + "-" + code[(idx + 1)..];
    }

    // Deletes the generated output folder for the given card type using normalized name matching.
    // Uses exact match only (no stem prefix) to avoid accidentally deleting folders for similar names.
    private static void DeleteOutputFolderForCardType(string cardName)
    {
        if (string.IsNullOrEmpty(_outputDir) || !Directory.Exists(_outputDir)) return;

        static string Normalize(string s) => s.ToLowerInvariant().Replace("_", "").Replace("-", "");
        string normalizedCard = Normalize(cardName);

        string? folder = Directory.GetDirectories(_outputDir)
            .FirstOrDefault(d => Normalize(Path.GetFileName(d)!) == normalizedCard);

        if (folder is not null)
            try { Directory.Delete(folder, recursive: true); }
            catch { /* silently ignore — the folder will be recreated on next generation */ }
    }

    // ── Card Groups ────────────────────────────────────────────────────────────
    private static string GetGroupsFilePath() =>
        Path.Combine(AppContext.BaseDirectory, "Files", "card-groups.json");

    private static List<CardGroup> LoadGroups()
    {
        var path = GetGroupsFilePath();
        if (!File.Exists(path)) return [];
        try
        {
            var json = File.ReadAllText(path);
            return System.Text.Json.JsonSerializer.Deserialize<List<CardGroup>>(json,
                new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? [];
        }
        catch { return []; }
    }

    private static void SaveGroups(List<CardGroup> groups)
    {
        var path = GetGroupsFilePath();
        Directory.CreateDirectory(Path.GetDirectoryName(path)!);
        File.WriteAllText(path, System.Text.Json.JsonSerializer.Serialize(groups,
            new System.Text.Json.JsonSerializerOptions { WriteIndented = true }));
    }

    private static void AssignTypeToGroup(string typeName, string groupName)
    {
        var groups = LoadGroups();
        // Remove from any existing group first
        foreach (var g in groups) g.Types.Remove(typeName);
        var target = groups.FirstOrDefault(g =>
            string.Equals(g.Name, groupName, StringComparison.OrdinalIgnoreCase));
        if (target is null) { groups.Add(new CardGroup { Name = groupName, Types = [typeName] }); }
        else if (!target.Types.Contains(typeName)) target.Types.Add(typeName);
        SaveGroups(groups);
    }

    private static void RemoveTypeFromAllGroups(string typeName)
    {
        var groups = LoadGroups();
        bool changed = false;
        foreach (var g in groups) if (g.Types.Remove(typeName)) changed = true;
        if (changed) SaveGroups(groups);
    }

    private static void RenameTypeInGroups(string oldName, string newName)
    {
        var groups = LoadGroups();
        bool changed = false;
        foreach (var g in groups)
        {
            int idx = g.Types.IndexOf(oldName);
            if (idx >= 0) { g.Types[idx] = newName; changed = true; }
        }
        if (changed) SaveGroups(groups);
    }

    private static (string? shortImg, string? extendedImg) FindOutputImages(string cardName, bool isExtendable)
    {
        if (string.IsNullOrEmpty(_outputDir) || !Directory.Exists(_outputDir))
            return (null, null);

        // Normalize a name by stripping separators: "research_institute" → "researchinstitute"
        static string Normalize(string s) => s.ToLowerInvariant().Replace("_", "").Replace("-", "");

        // Prioritize exact normalized match (handles multi-word names like "ResearchInstitute" → folder "research_institute"),
        // then fall back to stem prefix (handles pluralization like "Country" → folder "countries").
        string normalizedCard = Normalize(cardName);
        string stem = normalizedCard.Length > 1 ? normalizedCard[..^1] : normalizedCard;
        string? folder = Directory.GetDirectories(_outputDir)
            .Select(d => Path.GetFileName(d)!)
            .FirstOrDefault(d =>
            {
                string nd = Normalize(d);
                return nd == normalizedCard || nd.StartsWith(stem, StringComparison.OrdinalIgnoreCase);
            });

        if (folder is null) return (null, null);

        string folderPath = Path.Combine(_outputDir, folder);

        if (!isExtendable)
        {
            var files = Directory.GetFiles(folderPath, "*.png", SearchOption.TopDirectoryOnly);
            if (files.Length == 0) return (null, null);
            string pick = files[Random.Shared.Next(files.Length)];
            return ($"/output-cards/{folder}/{Path.GetFileName(pick)}", null);
        }

        // Extendable cards have shortened/ and extended/ subdirectories
        string? shortImg = null, extImg = null;
        string shortDir = Path.Combine(folderPath, "shortened");
        string extDir   = Path.Combine(folderPath, "extended");

        if (Directory.Exists(shortDir))
        {
            var files = Directory.GetFiles(shortDir, "*.png", SearchOption.TopDirectoryOnly);
            if (files.Length > 0)
            {
                string pick = files[Random.Shared.Next(files.Length)];
                shortImg = $"/output-cards/{folder}/shortened/{Path.GetFileName(pick)}";
            }
        }
        if (Directory.Exists(extDir))
        {
            var files = Directory.GetFiles(extDir, "*.png", SearchOption.TopDirectoryOnly);
            if (files.Length > 0)
            {
                string pick = files[Random.Shared.Next(files.Length)];
                extImg = $"/output-cards/{folder}/extended/{Path.GetFileName(pick)}";
            }
        }

        return (shortImg, extImg);
    }

    private static string GetDashboardHtml() => """
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>MayGraph Cards — Dashboard</title>
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Fira+Code:wght@400;500&display=swap" rel="stylesheet">
            <style>
                /* ── Bildyx design system — light theme ── */
                :root {
                    --bg:      #ffffff;
                    --s0:      #f8f9fc;
                    --s1:      #f3f4f9;
                    --s2:      #ebedf4;
                    --s3:      #dee1ea;
                    --bd:      #e4e7ed;
                    --bd-sm:   #edf0f5;
                    --bd-hi:   rgba(34,68,236,0.25);
                    --p:       #2244ec;
                    --p-dk:    #1a35bb;
                    --p-hi:    #4361f5;
                    --p-glow:  rgba(34,68,236,0.12);
                    --p-dim:   rgba(34,68,236,0.06);
                    --t1:      #0f1729;
                    --t2:      #4a5578;
                    --t3:      #9aa5bc;
                    --green:   #059669;
                    --green-bg:#f0fdf4;
                    --green-bd:#bbf7d0;
                    --red:     #dc2626;
                    --red-bg:  #fef2f2;
                    --red-bd:  #fecaca;
                    --r-sm: 6px; --r-md: 8px; --r-lg: 12px;
                    --tr: 0.13s ease;
                    --sh-sm: 0 1px 3px rgba(15,23,41,0.06), 0 1px 2px rgba(15,23,41,0.04);
                    --sh-md: 0 4px 12px rgba(15,23,41,0.08), 0 1px 3px rgba(15,23,41,0.05);
                    --sh-lg: 0 10px 28px rgba(15,23,41,0.1), 0 2px 6px rgba(15,23,41,0.06);
                }

                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

                body {
                    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
                    background: var(--bg);
                    color: var(--t1);
                    height: 100vh;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    -webkit-font-smoothing: antialiased;
                }

                ::-webkit-scrollbar { width: 5px; height: 5px; }
                ::-webkit-scrollbar-track { background: var(--s0); }
                ::-webkit-scrollbar-thumb { background: var(--s3); border-radius: 99px; }
                ::-webkit-scrollbar-thumb:hover { background: var(--t3); }

                /* ── Header ── */
                .header {
                    background: #fff;
                    border-bottom: 1px solid var(--bd);
                    padding: 0 24px;
                    height: 56px;
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    flex-shrink: 0;
                    box-shadow: var(--sh-sm);
                    position: relative;
                    z-index: 10;
                }

                .header-dot {
                    width: 8px; height: 8px;
                    background: var(--p);
                    border-radius: 50%;
                    flex-shrink: 0;
                }

                .header h1 {
                    font-size: 0.95rem;
                    font-weight: 700;
                    letter-spacing: -0.02em;
                    color: var(--t1);
                }

                .header-nav { margin-left: auto; display: flex; gap: 4px; }

                .nav-btn {
                    background: transparent;
                    border: 1px solid transparent;
                    color: var(--t2);
                    padding: 5px 14px;
                    border-radius: var(--r-md);
                    font-size: 0.8rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: var(--tr);
                    font-family: 'Plus Jakarta Sans', sans-serif;
                }

                .nav-btn:hover { color: var(--t1); background: var(--s1); }
                .nav-btn.active { color: var(--p); background: var(--p-dim); border-color: var(--bd-hi); }

                .header-count {
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: var(--t3);
                    background: var(--s1);
                    padding: 3px 11px;
                    border-radius: 99px;
                    border: 1px solid var(--bd);
                    white-space: nowrap;
                }

                .btn-restart {
                    background: rgba(220,38,38,0.06);
                    border: 1px solid rgba(220,38,38,0.22);
                    color: #dc2626;
                    padding: 5px 13px;
                    border-radius: var(--r-md);
                    font-size: 0.8rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: var(--tr);
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    flex-shrink: 0;
                }
                .btn-restart:hover { background: rgba(220,38,38,0.13); border-color: rgba(220,38,38,0.45); color: #b91c1c; }
                .btn-restart:disabled { opacity: 0.4; cursor: not-allowed; }
                .btn-restart-icon { font-size: 1.3rem; line-height: 1; transform: translateY(-2px); display: inline-block; }

                .restart-overlay {
                    display: none; position: fixed; inset: 0;
                    background: rgba(15,23,41,0.6);
                    z-index: 9999; align-items: center; justify-content: center;
                    backdrop-filter: blur(3px);
                }
                .restart-overlay.open { display: flex; }
                .restart-box {
                    background: #fff; border-radius: var(--r-lg);
                    padding: 32px 40px; text-align: center;
                    box-shadow: 0 20px 60px rgba(15,23,41,0.18);
                    max-width: 300px; width: 90%;
                }
                .restart-box h3 { font-size: 1rem; font-weight: 700; color: var(--t1); margin-bottom: 8px; }
                .restart-box p { font-size: 0.82rem; color: var(--t2); line-height: 1.5; }
                .restart-spinner {
                    width: 26px; height: 26px;
                    border: 3px solid #fde68a; border-top-color: #d97706;
                    border-radius: 50%;
                    animation: restartSpin 0.8s linear infinite;
                    margin: 16px auto 0;
                }
                @keyframes restartSpin { to { transform: rotate(360deg); } }

                /* ── Layout ── */
                .main { flex: 1; display: flex; overflow: hidden; }

                /* ── Sidebar ── */
                .sidebar {
                    width: 216px;
                    background: var(--s0);
                    border-right: 1px solid var(--bd);
                    overflow-y: auto;
                    flex-shrink: 0;
                    display: flex;
                    flex-direction: column;
                }

                .sidebar-label {
                    padding: 18px 16px 8px;
                    font-size: 0.62rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 1.4px;
                    color: var(--t3);
                }

                .card-item {
                    padding: 9px 16px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    border-left: 2px solid transparent;
                    transition: var(--tr);
                    user-select: none;
                    min-height: 40px;
                }

                .card-item:hover { background: var(--s1); }

                .card-item.active {
                    background: var(--p-dim);
                    border-left-color: var(--p);
                }

                .card-item-name {
                    font-size: 0.84rem;
                    font-weight: 500;
                    color: var(--t2);
                    flex: 1;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .card-item.active .card-item-name { color: var(--p); font-weight: 700; }

                .card-item-badge {
                    font-size: 0.62rem;
                    font-weight: 700;
                    padding: 2px 7px;
                    border-radius: 99px;
                    background: var(--s2);
                    color: var(--t3);
                    border: 1px solid var(--bd);
                    flex-shrink: 0;
                }

                .card-item.active .card-item-badge { background: var(--p-dim); color: var(--p); border-color: var(--bd-hi); }

                /* ── Sidebar search ── */
                .sidebar-search-wrap { padding: 8px 12px 0; }
                .sidebar-search {
                    width: 100%;
                    height: 32px;
                    border: 1px solid var(--bd);
                    border-radius: var(--r-md);
                    padding: 0 10px 0 30px;
                    font-size: 0.78rem;
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    color: var(--t1);
                    background: var(--s0) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' stroke='%239aa5bc' stroke-width='2' viewBox='0 0 24 24'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cpath d='m21 21-4.35-4.35'/%3E%3C/svg%3E") no-repeat 10px center;
                    box-sizing: border-box;
                    outline: none;
                    transition: border-color var(--tr);
                }
                .sidebar-search:focus { border-color: var(--bd-hi); }

                /* ── Group sections in sidebar ── */
                .group-section { margin: 4px 0; }
                .group-header {
                    display: flex;
                    align-items: center;
                    padding: 6px 8px 6px 14px;
                    cursor: pointer;
                    border-radius: 6px;
                    margin: 0 4px;
                    transition: var(--tr);
                    user-select: none;
                    gap: 6px;
                }
                .group-header:hover { background: var(--s1); }
                .group-header:hover .group-actions { opacity: 1; }
                .group-chevron {
                    font-size: 0.6rem;
                    color: var(--t3);
                    transition: transform 0.18s ease;
                    width: 10px;
                    flex-shrink: 0;
                }
                .group-chevron.open { transform: rotate(90deg); }
                .group-name {
                    font-size: 0.72rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    color: var(--t3);
                    flex: 1;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                .group-count {
                    font-size: 0.62rem;
                    font-weight: 700;
                    padding: 1px 6px;
                    border-radius: 99px;
                    background: var(--s2);
                    color: var(--t3);
                    border: 1px solid var(--bd);
                }
                .group-actions {
                    display: flex;
                    gap: 2px;
                    opacity: 0;
                    transition: opacity 0.15s;
                    flex-shrink: 0;
                }
                .group-action-btn {
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    padding: 2px 5px;
                    border-radius: 4px;
                    font-size: 0.72rem;
                    color: var(--t3);
                    transition: var(--tr);
                }
                .group-action-btn:hover { background: var(--s2); color: var(--t1); }
                .group-action-btn.danger:hover { background: rgba(220,38,38,0.08); color: var(--red); }
                .group-items { padding-bottom: 4px; }
                .group-items .card-item { padding-left: 28px; }
                .ungrouped-label {
                    padding: 10px 16px 4px;
                    font-size: 0.62rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 1.2px;
                    color: var(--t3);
                    opacity: 0.7;
                }

                /* ── Sidebar "New group" button ── */
                .sidebar-label-row {
                    display: flex;
                    align-items: center;
                    padding: 14px 16px 6px;
                    gap: 6px;
                }
                .sidebar-label-row .sidebar-label { padding: 0; flex: 1; }
                .new-group-btn {
                    background: transparent;
                    border: 1px solid var(--bd);
                    color: var(--t3);
                    padding: 2px 8px;
                    border-radius: var(--r-md);
                    font-size: 0.68rem;
                    font-weight: 600;
                    cursor: pointer;
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    transition: var(--tr);
                }
                .new-group-btn:hover { background: var(--s1); color: var(--t2); border-color: var(--bd-hi); }

                /* ── Overview group sections ── */
                .overview-group-section { margin-bottom: 36px; }
                .overview-group-header {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 14px;
                    padding-bottom: 8px;
                    border-bottom: 1px solid var(--bd);
                }
                .overview-group-title {
                    font-size: 0.9rem;
                    font-weight: 800;
                    color: var(--t1);
                    letter-spacing: -0.01em;
                }
                .overview-group-count {
                    font-size: 0.72rem;
                    font-weight: 600;
                    padding: 2px 8px;
                    border-radius: 99px;
                    background: var(--s2);
                    color: var(--t3);
                    border: 1px solid var(--bd);
                }

                /* ── Group management modal ── */
                .grp-overlay {
                    display: none;
                    position: fixed;
                    inset: 0;
                    background: rgba(15,23,41,0.3);
                    z-index: 9100;
                    backdrop-filter: blur(2px);
                }
                .grp-overlay.open { display: block; }
                .grp-modal {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) scale(0.97);
                    z-index: 9200;
                    background: #fff;
                    border-radius: var(--r-lg);
                    box-shadow: 0 20px 60px rgba(15,23,41,0.2);
                    width: 420px;
                    max-width: 96vw;
                    display: none;
                    flex-direction: column;
                    opacity: 0;
                    transition: opacity 0.15s ease, transform 0.15s ease;
                }
                .grp-modal.open {
                    display: flex;
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(1);
                }
                .grp-modal-header {
                    padding: 18px 20px 14px;
                    border-bottom: 1px solid var(--bd);
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .grp-modal-header h3 { font-size: 0.95rem; font-weight: 800; color: var(--t1); flex: 1; }
                .grp-modal-close {
                    background: transparent;
                    border: none;
                    font-size: 1.1rem;
                    cursor: pointer;
                    color: var(--t3);
                    padding: 2px 6px;
                    border-radius: 4px;
                }
                .grp-modal-close:hover { background: var(--s1); color: var(--t1); }
                .grp-modal-body { padding: 18px 20px; }
                .grp-field { margin-bottom: 14px; }
                .grp-field label { display: block; font-size: 0.75rem; font-weight: 700; color: var(--t2); margin-bottom: 6px; }
                .grp-field input {
                    width: 100%;
                    height: 36px;
                    border: 1px solid var(--bd);
                    border-radius: var(--r-md);
                    padding: 0 12px;
                    font-size: 0.84rem;
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    color: var(--t1);
                    box-sizing: border-box;
                    outline: none;
                    transition: border-color var(--tr);
                }
                .grp-field input:focus { border-color: var(--bd-hi); box-shadow: 0 0 0 3px var(--p-dim); }
                .grp-modal-footer {
                    padding: 12px 20px 16px;
                    display: flex;
                    justify-content: flex-end;
                    gap: 8px;
                    border-top: 1px solid var(--bd);
                }
                .grp-error { color: var(--red); font-size: 0.75rem; font-weight: 600; margin-top: 4px; }

                /* ── Content area ── */
                .content { flex: 1; overflow-y: auto; padding: 24px 28px; background: var(--bg); }

                /* ── Overview grid ── */
                .overview-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 14px;
                    align-items: start;
                }

                .overview-card {
                    background: #fff;
                    border: 1px solid var(--bd);
                    border-radius: var(--r-lg);
                    overflow: hidden;
                    cursor: pointer;
                    transition: border-color var(--tr), box-shadow var(--tr), transform 0.18s ease;
                    box-shadow: var(--sh-sm);
                }

                .overview-card:hover {
                    border-color: var(--p-hi);
                    box-shadow: var(--sh-md);
                    transform: translateY(-2px);
                }

                .overview-card-header {
                    padding: 14px 16px 12px;
                    border-bottom: 1px solid var(--bd-sm);
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    background: #fff;
                }

                .overview-card-title {
                    font-size: 0.92rem;
                    font-weight: 700;
                    color: var(--t1);
                }

                .overview-card-badges { display: flex; gap: 5px; margin-left: auto; flex-shrink: 0; }

                .badge {
                    font-size: 0.63rem;
                    font-weight: 700;
                    padding: 2px 8px;
                    border-radius: 99px;
                }

                .badge-count { background: var(--s1); color: var(--t2); border: 1px solid var(--bd); }
                .badge-ext { background: var(--green-bg); color: var(--green); border: 1px solid var(--green-bd); }
                .badge-fixed { background: var(--s2); color: var(--t3); border: 1px solid var(--bd); }

                .overview-mockup {
                    padding: 16px 18px 12px;
                    display: flex;
                    justify-content: center;
                    background: var(--s0);
                    border-bottom: 1px solid var(--bd-sm);
                }

                .overview-mockup img {
                    max-width: 100%;
                    max-height: 190px;
                    object-fit: contain;
                    border-radius: 6px;
                    box-shadow: var(--sh-md);
                }

                .overview-mockup-placeholder {
                    height: 100px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--t3);
                    font-size: 0.78rem;
                    font-style: italic;
                }

                .overview-props { padding: 13px 16px 15px; }
                .overview-props-section { margin-bottom: 9px; }
                .overview-props-section:last-child { margin-bottom: 0; }

                .overview-props-label {
                    font-size: 0.6rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 1.2px;
                    margin-bottom: 5px;
                }

                .overview-props-label.req { color: var(--red); }
                .overview-props-label.opt { color: var(--p); }

                .prop-tags { display: flex; flex-wrap: wrap; gap: 4px; }

                .prop-tag {
                    font-family: 'Fira Code', monospace;
                    font-size: 0.7rem;
                    padding: 2px 7px;
                    border-radius: 4px;
                    font-weight: 500;
                    word-break: break-word;
                }

                .prop-tag.req { background: var(--red-bg); color: var(--red); border: 1px solid var(--red-bd); }
                .prop-tag.opt { background: var(--p-dim); color: var(--p); border: 1px solid var(--bd-hi); }

                /* ── Detail view ── */
                .detail { width: 100%; }

                .detail-back {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    color: var(--t2);
                    font-size: 0.8rem;
                    font-weight: 600;
                    cursor: pointer;
                    margin-bottom: 16px;
                    padding: 4px 0;
                    user-select: none;
                    transition: color var(--tr);
                }

                .detail-back:hover { color: var(--p); }

                .detail-header {
                    background: #fff;
                    border: 1px solid var(--bd);
                    border-radius: var(--r-lg);
                    overflow: hidden;
                    margin-bottom: 12px;
                    box-shadow: var(--sh-sm);
                }

                .detail-header-top {
                    padding: 20px 22px 16px;
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    gap: 16px;
                }

                .detail-title {
                    font-size: 1.5rem;
                    font-weight: 800;
                    color: var(--t1);
                    letter-spacing: -0.03em;
                }

                .detail-badges { display: flex; gap: 6px; margin-top: 7px; flex-wrap: wrap; }

                .detail-mockup {
                    background: var(--s0);
                    border-top: 1px solid var(--bd-sm);
                    padding: 24px;
                    display: flex;
                    justify-content: center;
                    align-items: flex-start;
                    gap: 48px;
                }

                .detail-mockup img {
                    max-height: 380px;
                    max-width: 46%;
                    object-fit: contain;
                    border-radius: 8px;
                    box-shadow: var(--sh-lg);
                }

                .detail-mockup.single img { max-width: 100%; }

                .section {
                    background: #fff;
                    border: 1px solid var(--bd);
                    border-radius: var(--r-lg);
                    overflow: hidden;
                    margin-bottom: 10px;
                    box-shadow: var(--sh-sm);
                }

                .section-header {
                    padding: 9px 18px;
                    font-size: 0.6rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 1.3px;
                    background: var(--s0);
                    border-bottom: 1px solid var(--bd-sm);
                }

                .section-header.required { color: var(--red); }
                .section-header.optional { color: var(--p); }

                .props-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); }

                .prop {
                    padding: 11px 18px;
                    border-bottom: 1px solid var(--bd-sm);
                    border-right: 1px solid var(--bd-sm);
                    transition: background var(--tr);
                }

                .prop:hover { background: var(--s0); }

                .prop-name {
                    font-family: 'Fira Code', monospace;
                    font-size: 0.78rem;
                    font-weight: 500;
                    color: var(--t1);
                    word-break: break-word;
                }

                .prop-type { font-size: 0.6rem; margin-top: 3px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; }
                .prop-type.req { color: var(--red); }
                .prop-type.opt { color: var(--t3); }

                /* ── Placeholder ── */
                .placeholder {
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    color: var(--t3);
                    font-size: 0.84rem;
                }

                .placeholder-arrow { font-size: 1.8rem; opacity: 0.35; }

                /* ── New card type button ── */
                .new-card-btn {
                    display: flex;
                    align-items: center;
                    gap: 7px;
                    margin: 12px 12px 4px;
                    padding: 8px 13px;
                    background: var(--p);
                    color: white;
                    border: none;
                    border-radius: var(--r-md);
                    font-size: 0.8rem;
                    font-weight: 700;
                    cursor: pointer;
                    width: calc(100% - 24px);
                    transition: var(--tr);
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    box-shadow: 0 2px 6px var(--p-glow);
                }

                .new-card-btn:hover { background: var(--p-dk); box-shadow: var(--sh-md); }
                .new-card-btn .plus { font-size: 1rem; line-height: 1; }

                .generate-btn {
                    display: flex;
                    align-items: center;
                    gap: 7px;
                    margin: 4px 12px 12px;
                    padding: 8px 13px;
                    background: var(--green-bg);
                    color: var(--green);
                    border: 1px solid var(--green-bd);
                    border-radius: var(--r-md);
                    font-size: 0.8rem;
                    font-weight: 700;
                    cursor: pointer;
                    width: calc(100% - 24px);
                    transition: var(--tr);
                    font-family: 'Plus Jakarta Sans', sans-serif;
                }
                .generate-btn:hover { background: var(--green); color: white; box-shadow: 0 2px 8px rgba(5,150,105,0.2); }
                .generate-btn .gen-arrow { font-size: 0.65rem; }

                /* ── Generate modal ── */
                .gen-overlay {
                    display: none;
                    position: fixed;
                    inset: 0;
                    background: rgba(15,23,41,0.32);
                    z-index: 200;
                    backdrop-filter: blur(2px);
                }
                .gen-overlay.open { display: block; }

                .gen-modal {
                    display: none;
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 420px;
                    background: var(--bg);
                    border: 1px solid var(--bd);
                    border-radius: var(--r-lg);
                    box-shadow: var(--sh-lg);
                    z-index: 201;
                    overflow: hidden;
                }
                .gen-modal.open { display: block; }

                .gen-modal-header {
                    padding: 20px 24px 16px;
                    border-bottom: 1px solid var(--bd);
                }
                .gen-modal-header h2 {
                    font-size: 0.95rem;
                    font-weight: 800;
                    color: var(--t1);
                    margin: 0;
                    letter-spacing: -0.02em;
                }
                .gen-modal-header p { font-size: 0.78rem; color: var(--t2); margin: 4px 0 0; }

                .gen-modal-body { padding: 20px 24px; }

                .gen-stat-row {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 10px 0;
                    border-bottom: 1px solid var(--bd-sm);
                }
                .gen-stat-row:last-child { border-bottom: none; }
                .gen-stat-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
                .gen-stat-dot.green  { background: var(--green); }
                .gen-stat-dot.blue   { background: var(--p); }
                .gen-stat-dot.orange { background: #f59e0b; }
                .gen-stat-label { flex: 1; font-size: 0.84rem; color: var(--t2); }
                .gen-stat-value { font-size: 0.9rem; font-weight: 700; color: var(--t1); min-width: 28px; text-align: right; }

                .gen-modal-footer {
                    padding: 14px 24px;
                    border-top: 1px solid var(--bd);
                    display: flex;
                    justify-content: flex-end;
                    gap: 8px;
                }
                .gen-btn {
                    padding: 7px 16px;
                    border-radius: var(--r-md);
                    font-size: 0.8rem;
                    font-weight: 700;
                    cursor: pointer;
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    transition: var(--tr);
                    border: 1px solid var(--bd);
                    background: var(--s1);
                    color: var(--t1);
                }
                .gen-btn:hover:not(:disabled) { background: var(--s2); }
                .gen-btn.primary { background: var(--green-bg); color: var(--green); border-color: var(--green-bd); }
                .gen-btn.primary:hover:not(:disabled) { background: var(--green); color: white; }
                .gen-btn:disabled { opacity: 0.45; cursor: not-allowed; }

                .gen-warning { background:#fff8e1; border:1px solid #f0ad4e; border-radius:6px; padding:10px 16px; margin:0 24px 12px; font-size:0.82rem; color:#664d03; }
                .gen-warning ul { margin:5px 0 4px 16px; padding:0; }
                .gen-warning li { margin:2px 0; font-family:'Fira Code',monospace; font-size:0.8rem; }
                .gen-warning small { display:block; margin-top:4px; color:#856404; }
                .detail-csv-hint { font-size:0.78rem; color:var(--t3); margin-top:4px; }
                .detail-csv-hint code { background:var(--s1); padding:2px 5px; border-radius:4px; font-family:'Fira Code',monospace; font-size:0.77rem; color:var(--p); }

                .gen-progress-wrap { background: var(--s2); border-radius: 99px; height: 6px; overflow: hidden; margin-bottom: 10px; }
                .gen-progress-fill { height: 100%; background: var(--green); border-radius: 99px; transition: width 0.4s ease; width: 0%; }
                .gen-progress-label { font-size: 0.78rem; color: var(--t2); text-align: center; }
                .gen-progress-card { font-size: 0.72rem; color: var(--t3); text-align: center; margin-top: 5px; font-family: 'Fira Code', monospace; word-break: break-word; }

                .gen-complete-icon { font-size: 1.8rem; text-align: center; margin-bottom: 14px; }
                .gen-complete-stats { display: flex; flex-direction: column; gap: 8px; }
                .gen-complete-stat { display: flex; justify-content: space-between; font-size: 0.84rem; }
                .gen-complete-stat span:first-child { color: var(--t2); }
                .gen-complete-stat span:last-child { font-weight: 700; color: var(--t1); }
                .gen-error-msg { background: var(--red-bg); border: 1px solid var(--red-bd); border-radius: var(--r-md); padding: 10px 14px; color: var(--red); font-size: 0.78rem; font-weight: 600; margin-top: 8px; }

                /* ── Wizard ── */
                .wizard { width: 100%; max-width: 720px; margin: 0 auto; }

                .wizard-steps { display: flex; align-items: center; margin-bottom: 20px; }

                .wstep {
                    display: flex;
                    align-items: center;
                    gap: 7px;
                    font-size: 0.76rem;
                    font-weight: 600;
                    color: var(--t3);
                }

                .wstep.active { color: var(--p); }
                .wstep.done { color: var(--green); }

                .wstep-dot {
                    width: 24px; height: 24px;
                    border-radius: 50%;
                    background: var(--s2);
                    color: var(--t3);
                    display: flex; align-items: center; justify-content: center;
                    font-size: 0.67rem;
                    font-weight: 700;
                    flex-shrink: 0;
                    border: 1.5px solid var(--bd);
                }

                .wstep.active .wstep-dot { background: var(--p); color: white; border-color: var(--p); box-shadow: 0 2px 8px var(--p-glow); }
                .wstep.done .wstep-dot { background: var(--green-bg); color: var(--green); border-color: var(--green-bd); }

                .wstep-line { flex: 1; height: 1px; background: var(--bd); margin: 0 8px; min-width: 16px; }
                .wstep-line.done { background: var(--green-bd); }

                .wizard-card {
                    background: #fff;
                    border: 1px solid var(--bd);
                    border-radius: var(--r-lg);
                    overflow: hidden;
                    box-shadow: var(--sh-sm);
                }

                .wizard-card-header {
                    padding: 18px 24px 14px;
                    border-bottom: 1px solid var(--bd-sm);
                    background: var(--s0);
                }

                .wizard-card-header h2 {
                    font-size: 1.05rem;
                    font-weight: 800;
                    color: var(--t1);
                    letter-spacing: -0.02em;
                }

                .wizard-card-header p { font-size: 0.8rem; color: var(--t2); margin-top: 4px; }

                .wizard-card-body { padding: 22px 24px; }

                .wfield label {
                    display: block;
                    font-size: 0.7rem;
                    font-weight: 700;
                    color: var(--p);
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin-bottom: 8px;
                }

                .wfield input[type=text] {
                    width: 100%;
                    padding: 10px 14px;
                    background: #fff;
                    border: 1.5px solid var(--bd);
                    border-radius: var(--r-md);
                    font-size: 0.95rem;
                    color: var(--t1);
                    outline: none;
                    transition: border-color var(--tr), box-shadow var(--tr);
                    font-family: 'Plus Jakarta Sans', sans-serif;
                }

                .wfield input[type=text]::placeholder { color: var(--t3); }

                .wfield input[type=text]:focus {
                    border-color: var(--p);
                    box-shadow: 0 0 0 3px var(--p-glow);
                }

                .type-options { display: flex; gap: 12px; margin-top: 4px; }

                .type-option {
                    flex: 1;
                    padding: 14px 16px;
                    background: #fff;
                    border: 1.5px solid var(--bd);
                    border-radius: var(--r-md);
                    cursor: pointer;
                    transition: border-color var(--tr), box-shadow var(--tr);
                    user-select: none;
                }

                .type-option:hover { border-color: var(--p-hi); box-shadow: var(--sh-sm); }
                .type-option.selected { border-color: var(--p); background: var(--p-dim); box-shadow: 0 0 0 3px var(--p-glow); }

                .type-option-title {
                    font-size: 0.9rem;
                    font-weight: 700;
                    color: var(--t1);
                    margin-bottom: 3px;
                }

                .type-option-desc { font-size: 0.76rem; color: var(--t2); }

                .attr-columns { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

                .attr-col {
                    background: #fff;
                    border: 1px solid var(--bd);
                    border-radius: var(--r-md);
                    overflow: hidden;
                }

                .attr-col-header {
                    padding: 9px 13px;
                    font-size: 0.62rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 1.2px;
                    border-bottom: 1px solid var(--bd-sm);
                }

                .attr-col-header.req { color: var(--red); background: var(--red-bg); }
                .attr-col-header.opt { color: var(--p); background: var(--p-dim); }

                .attr-tags {
                    min-height: 72px;
                    padding: 8px 10px;
                    display: flex;
                    flex-wrap: wrap;
                    gap: 5px;
                    align-content: flex-start;
                }

                .attr-tag {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    padding: 3px 8px 3px 5px;
                    border-radius: 5px;
                    font-family: 'Fira Code', monospace;
                    font-size: 0.72rem;
                    font-weight: 500;
                }

                .attr-tag.req { background: var(--red-bg); color: var(--red); border: 1px solid var(--red-bd); }
                .attr-tag.opt { background: var(--p-dim); color: var(--p); border: 1px solid var(--bd-hi); }

                .attr-tag-remove {
                    cursor: pointer;
                    opacity: 0.35;
                    font-size: 0.85rem;
                    line-height: 1;
                    flex-shrink: 0;
                    transition: opacity var(--tr);
                }

                .attr-tag-remove:hover { opacity: 1; }

                .attr-tag-pin {
                    font-size: 0.6rem;
                    opacity: 0.3;
                    flex-shrink: 0;
                    cursor: default;
                    user-select: none;
                }

                .attr-add-wrap { padding: 8px 10px; border-top: 1px solid var(--bd-sm); }

                .attr-add-trigger {
                    width: 100%;
                    padding: 7px 11px;
                    background: transparent;
                    color: var(--t2);
                    border: 1.5px dashed var(--bd);
                    border-radius: var(--r-sm);
                    font-size: 0.78rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: border-color var(--tr), color var(--tr), background var(--tr);
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    text-align: left;
                }

                .attr-add-trigger:hover { border-color: var(--p); color: var(--p); background: var(--p-dim); }

                /* Floating panels */
                .attr-dropdown-panel {
                    position: fixed;
                    background: #fff;
                    border: 1px solid var(--bd);
                    border-radius: var(--r-md);
                    box-shadow: var(--sh-lg);
                    z-index: 9999;
                    display: none;
                    flex-direction: column;
                    overflow: hidden;
                }

                .attr-dropdown-search {
                    width: 100%;
                    padding: 10px 13px;
                    border: none;
                    border-bottom: 1px solid var(--bd);
                    outline: none;
                    font-size: 0.82rem;
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    background: var(--s0);
                    color: var(--t1);
                    box-sizing: border-box;
                }

                .attr-dropdown-search::placeholder { color: var(--t3); }

                .attr-dropdown-list { max-height: 210px; overflow-y: auto; }

                .attr-dropdown-item {
                    padding: 8px 13px;
                    font-family: 'Fira Code', monospace;
                    font-size: 0.78rem;
                    cursor: pointer;
                    border-bottom: 1px solid var(--bd-sm);
                    color: var(--t2);
                    transition: background var(--tr), color var(--tr);
                }

                .attr-dropdown-item:last-child { border-bottom: none; }
                .attr-dropdown-item:hover { background: var(--p-dim); color: var(--p); }

                .attr-dropdown-item.new-attr {
                    color: var(--green);
                    font-weight: 600;
                    background: var(--green-bg);
                    border-top: 1px solid var(--green-bd) !important;
                    border-bottom: none;
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    font-size: 0.8rem;
                }

                .attr-dropdown-item.new-attr:hover { background: #dcfce7; }

                .attr-dropdown-empty {
                    padding: 14px;
                    color: var(--t3);
                    font-size: 0.78rem;
                    text-align: center;
                    font-style: italic;
                }

                /* Icon picker */
                .icon-picker-panel {
                    position: fixed;
                    background: #fff;
                    border: 1px solid var(--bd);
                    border-radius: var(--r-lg);
                    box-shadow: var(--sh-lg);
                    z-index: 10000;
                    display: none;
                    flex-direction: column;
                    overflow: hidden;
                    width: 400px;
                }

                .icon-picker-header {
                    padding: 9px 10px;
                    border-bottom: 1px solid var(--bd);
                    display: flex;
                    gap: 7px;
                    align-items: center;
                    background: var(--s0);
                }

                .icon-picker-search {
                    flex: 1;
                    padding: 7px 11px;
                    background: #fff;
                    border: 1px solid var(--bd);
                    border-radius: var(--r-sm);
                    font-size: 0.8rem;
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    color: var(--t1);
                    outline: none;
                    transition: border-color var(--tr), box-shadow var(--tr);
                }

                .icon-picker-search::placeholder { color: var(--t3); }
                .icon-picker-search:focus { border-color: var(--p); box-shadow: 0 0 0 2px var(--p-glow); }

                .icon-upload-label {
                    padding: 6px 11px;
                    background: var(--p-dim);
                    color: var(--p);
                    border: 1px solid var(--bd-hi);
                    border-radius: var(--r-sm);
                    font-size: 0.72rem;
                    font-weight: 700;
                    cursor: pointer;
                    white-space: nowrap;
                    transition: var(--tr);
                    font-family: 'Plus Jakarta Sans', sans-serif;
                }

                .icon-upload-label:hover { background: var(--p); color: white; }

                .icon-grid {
                    display: grid;
                    grid-template-columns: repeat(6, 1fr);
                    gap: 3px;
                    padding: 8px;
                    max-height: 280px;
                    overflow-y: auto;
                    background: var(--bg);
                }

                .icon-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 3px;
                    padding: 6px 2px;
                    border-radius: var(--r-sm);
                    cursor: pointer;
                    border: 1.5px solid transparent;
                    transition: border-color 0.12s, background 0.12s;
                    background: #fff;
                }

                .icon-item:hover { background: var(--s1); border-color: var(--bd); }
                .icon-item.selected { border-color: var(--p); background: var(--p-dim); }

                .icon-item img { width: 30px; height: 30px; object-fit: contain; }
                .icon-item-name {
                    font-size: 0.48rem;
                    color: var(--t3);
                    text-align: center;
                    max-width: 52px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .icon-picker-footer {
                    padding: 8px 11px;
                    border-top: 1px solid var(--bd);
                    display: flex;
                    justify-content: flex-end;
                    background: var(--s0);
                }

                .icon-skip-btn {
                    background: none;
                    border: none;
                    color: var(--t3);
                    font-size: 0.76rem;
                    font-weight: 600;
                    cursor: pointer;
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    transition: color var(--tr);
                }

                .icon-skip-btn:hover { color: var(--t2); }

                .icon-ctx-menu {
                    position: fixed;
                    background: #fff;
                    border: 1px solid var(--bd);
                    border-radius: var(--r-sm);
                    box-shadow: var(--sh-lg);
                    z-index: 20000;
                    display: none;
                    min-width: 140px;
                    padding: 4px 0;
                }

                .icon-ctx-item {
                    display: flex;
                    align-items: center;
                    gap: 7px;
                    padding: 7px 13px;
                    font-size: 0.8rem;
                    cursor: pointer;
                    color: var(--t1);
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    transition: background var(--tr);
                }

                .icon-ctx-item:hover { background: var(--s1); }
                .icon-ctx-item.danger { color: var(--red); }
                .icon-ctx-item.danger:hover { background: rgba(220,38,38,0.06); }

                .attr-tag-icon {
                    width: 15px; height: 15px;
                    object-fit: contain;
                    border-radius: 3px;
                    cursor: pointer;
                    opacity: 0.6;
                    flex-shrink: 0;
                    transition: opacity var(--tr);
                }

                .attr-tag-icon:hover { opacity: 1; }

                /* Action buttons */
                .modify-card-btn {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    padding: 7px 13px;
                    background: var(--p-dim);
                    color: var(--p);
                    border: 1px solid var(--bd-hi);
                    border-radius: var(--r-md);
                    font-size: 0.8rem;
                    font-weight: 700;
                    cursor: pointer;
                    white-space: nowrap;
                    flex-shrink: 0;
                    transition: var(--tr);
                    font-family: 'Plus Jakarta Sans', sans-serif;
                }

                .modify-card-btn:hover { background: var(--p); color: white; border-color: var(--p); box-shadow: 0 2px 8px var(--p-glow); }

                .delete-card-btn {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    padding: 7px 13px;
                    background: var(--red-bg);
                    color: var(--red);
                    border: 1px solid var(--red-bd);
                    border-radius: var(--r-md);
                    font-size: 0.8rem;
                    font-weight: 700;
                    cursor: pointer;
                    white-space: nowrap;
                    flex-shrink: 0;
                    transition: var(--tr);
                    font-family: 'Plus Jakarta Sans', sans-serif;
                }

                .delete-card-btn:hover { background: var(--red); color: white; border-color: var(--red); box-shadow: 0 2px 8px rgba(220,38,38,0.2); }

                .group-assign-btn {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    padding: 7px 13px;
                    background: var(--s1);
                    color: var(--t2);
                    border: 1px solid var(--bd);
                    border-radius: var(--r-md);
                    font-size: 0.8rem;
                    font-weight: 600;
                    cursor: pointer;
                    white-space: nowrap;
                    flex-shrink: 0;
                    transition: var(--tr);
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    max-width: 160px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .group-assign-btn:hover { background: var(--s2); border-color: var(--bd-hi); color: var(--t1); }
                .group-assign-btn.assigned { background: rgba(34,68,236,0.06); border-color: var(--bd-hi); color: var(--p); }
                .group-assign-btn.assigned:hover { background: var(--p-dim); }

                /* Group assign dropdown panel */
                .group-assign-panel {
                    position: fixed;
                    z-index: 8800;
                    background: #fff;
                    border: 1px solid var(--bd);
                    border-radius: var(--r-lg);
                    box-shadow: 0 8px 32px rgba(15,23,41,0.14);
                    min-width: 200px;
                    max-height: 320px;
                    overflow-y: auto;
                    display: none;
                    flex-direction: column;
                    padding: 6px 0;
                }
                .group-assign-panel.open { display: flex; }
                .group-assign-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 14px;
                    font-size: 0.82rem;
                    font-weight: 500;
                    color: var(--t1);
                    cursor: pointer;
                    transition: background 0.1s;
                    white-space: nowrap;
                }
                .group-assign-item:hover { background: var(--s1); }
                .group-assign-item.active { color: var(--p); font-weight: 700; }
                .group-assign-item .gap-check { width: 14px; font-size: 0.8rem; flex-shrink: 0; }
                .group-assign-item.new-group { color: var(--p); }
                .group-assign-item.new-group:hover { background: var(--p-dim); }
                .group-assign-item.remove-group { color: var(--t3); font-size: 0.78rem; }
                .group-assign-item.remove-group:hover { background: rgba(220,38,38,0.06); color: var(--red); }
                .group-assign-divider { height: 1px; background: var(--bd); margin: 4px 0; }
                .group-assign-empty { padding: 10px 14px; font-size: 0.78rem; color: var(--t3); font-style: italic; }

                /* Wizard footer */
                .wizard-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 14px 24px;
                    border-top: 1px solid var(--bd-sm);
                    background: var(--s0);
                }

                .wizard-footer-left { display: flex; gap: 8px; }

                .wbtn {
                    padding: 9px 20px;
                    border-radius: var(--r-md);
                    font-size: 0.84rem;
                    font-weight: 700;
                    cursor: pointer;
                    border: 1px solid transparent;
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    transition: var(--tr);
                }

                .wbtn-ghost { background: var(--s2); color: var(--t2); border-color: var(--bd); }
                .wbtn-ghost:hover { background: var(--s3); color: var(--t1); }
                .wbtn-primary { background: var(--p); color: white; box-shadow: 0 2px 6px var(--p-glow); }
                .wbtn-primary:hover { background: var(--p-dk); box-shadow: var(--sh-md); }

                /* ── Browse Cards view ── */
                .browse-toolbar {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 20px;
                    flex-wrap: wrap;
                }

                .browse-search {
                    flex: 1;
                    min-width: 180px;
                    height: 36px;
                    border: 1px solid var(--bd);
                    border-radius: var(--r-md);
                    padding: 0 14px 0 36px;
                    font-size: 0.84rem;
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    color: var(--t1);
                    background: #fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' fill='none' stroke='%239aa5bc' stroke-width='2' viewBox='0 0 24 24'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cpath d='m21 21-4.35-4.35'/%3E%3C/svg%3E") no-repeat 12px center;
                    transition: border-color var(--tr), box-shadow var(--tr);
                    outline: none;
                }

                .browse-search:focus { border-color: var(--bd-hi); box-shadow: 0 0 0 3px var(--p-dim); }

                .browse-count-label {
                    font-size: 0.78rem;
                    color: var(--t3);
                    white-space: nowrap;
                }

                .browse-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
                    gap: 12px;
                }

                .browse-card {
                    background: #fff;
                    border: 1px solid var(--bd);
                    border-radius: var(--r-lg);
                    overflow: hidden;
                    cursor: pointer;
                    transition: border-color var(--tr), box-shadow var(--tr), transform 0.15s ease;
                    box-shadow: var(--sh-sm);
                }

                .browse-card:hover {
                    border-color: var(--bd-hi);
                    box-shadow: var(--sh-md);
                    transform: translateY(-2px);
                }

                .browse-thumb {
                    aspect-ratio: 3/4;
                    background: var(--s0);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                    border-bottom: 1px solid var(--bd-sm);
                }

                .browse-thumb img {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                    padding: 8px;
                }

                .browse-thumb-placeholder {
                    color: var(--t3);
                    font-size: 0.72rem;
                    font-style: italic;
                }

                .browse-meta {
                    padding: 8px 10px;
                }

                .browse-serial {
                    font-family: 'Fira Code', monospace;
                    font-size: 0.72rem;
                    font-weight: 500;
                    color: var(--t1);
                    display: block;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .browse-name {
                    font-size: 0.73rem;
                    font-weight: 500;
                    color: var(--t2);
                    display: block;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    margin-top: 2px;
                }

                .browse-mode-toggle {
                    display: flex;
                    background: var(--s1);
                    border: 1px solid var(--bd);
                    border-radius: var(--r-md);
                    padding: 2px;
                    gap: 2px;
                    flex-shrink: 0;
                }
                .browse-mode-btn {
                    background: transparent;
                    border: none;
                    padding: 4px 11px;
                    border-radius: calc(var(--r-md) - 2px);
                    font-size: 0.75rem;
                    font-weight: 600;
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    color: var(--t2);
                    cursor: pointer;
                    transition: var(--tr);
                    white-space: nowrap;
                    line-height: 1.6;
                }
                .browse-mode-btn.active {
                    background: #fff;
                    color: var(--p);
                    box-shadow: 0 1px 3px rgba(15,23,41,0.08);
                }

                .browse-type-tag {
                    font-size: 0.62rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.9px;
                    color: var(--t3);
                    margin-top: 3px;
                    display: block;
                }

                .browse-empty {
                    grid-column: 1/-1;
                    padding: 60px 0;
                    text-align: center;
                    color: var(--t3);
                    font-size: 0.88rem;
                }

                /* Browse hover preview */
                #card-hover-preview {
                    position: fixed;
                    z-index: 8500;
                    background: #fff;
                    border: 1px solid var(--bd-hi);
                    border-radius: var(--r-lg);
                    box-shadow: 0 12px 48px rgba(15,23,41,0.22);
                    padding: 8px;
                    pointer-events: none;
                    display: none;
                    opacity: 0;
                    transition: opacity 0.12s ease;
                }
                #card-hover-preview.visible {
                    display: block;
                    opacity: 1;
                }
                #card-hover-preview img {
                    display: block;
                    width: 340px;
                    height: auto;
                    border-radius: 8px;
                }

                /* Browse sidebar state */
                .browse-type-item {
                    padding: 9px 16px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    border-left: 2px solid transparent;
                    transition: var(--tr);
                    user-select: none;
                    min-height: 38px;
                }

                .browse-type-item:hover { background: var(--s1); }

                .browse-type-item.active {
                    background: var(--p-dim);
                    border-left-color: var(--p);
                }

                .browse-type-name {
                    font-size: 0.84rem;
                    font-weight: 500;
                    color: var(--t2);
                    flex: 1;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    text-transform: capitalize;
                }

                .browse-type-item.active .browse-type-name { color: var(--p); font-weight: 700; }

                .browse-type-count {
                    font-size: 0.62rem;
                    font-weight: 700;
                    padding: 2px 7px;
                    border-radius: 99px;
                    background: var(--s2);
                    color: var(--t3);
                    border: 1px solid var(--bd);
                    flex-shrink: 0;
                }

                .browse-type-item.active .browse-type-count { background: var(--p-dim); color: var(--p); border-color: var(--bd-hi); }

                /* ── Icons manager view ── */
                .icons-view { width: 100%; }

                .icons-folder-tabs {
                    display: flex;
                    gap: 4px;
                    margin-bottom: 20px;
                    border-bottom: 1px solid var(--bd);
                    padding-bottom: 0;
                }

                .icons-tab {
                    padding: 8px 18px;
                    border-radius: var(--r-md) var(--r-md) 0 0;
                    border: 1px solid transparent;
                    border-bottom: none;
                    background: transparent;
                    color: var(--t2);
                    font-size: 0.84rem;
                    font-weight: 600;
                    cursor: pointer;
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    transition: var(--tr);
                    position: relative;
                    bottom: -1px;
                }

                .icons-tab:hover { color: var(--t1); background: var(--s1); }

                .icons-tab.active {
                    color: var(--p);
                    background: var(--bg);
                    border-color: var(--bd);
                    border-bottom-color: var(--bg);
                }

                .icons-toolbar {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 16px;
                }

                .icons-search {
                    flex: 1;
                    height: 34px;
                    border: 1px solid var(--bd);
                    border-radius: var(--r-md);
                    padding: 0 12px 0 34px;
                    font-size: 0.83rem;
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    color: var(--t1);
                    background: #fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='13' height='13' fill='none' stroke='%239aa5bc' stroke-width='2' viewBox='0 0 24 24'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cpath d='m21 21-4.35-4.35'/%3E%3C/svg%3E") no-repeat 10px center;
                    outline: none;
                    transition: border-color var(--tr), box-shadow var(--tr);
                }

                .icons-search:focus { border-color: var(--bd-hi); box-shadow: 0 0 0 3px var(--p-dim); }

                .icons-upload-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 0 16px;
                    height: 34px;
                    border-radius: var(--r-md);
                    border: 1px solid var(--bd);
                    background: var(--s1);
                    color: var(--t1);
                    font-size: 0.82rem;
                    font-weight: 700;
                    cursor: pointer;
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    transition: var(--tr);
                    white-space: nowrap;
                }

                .icons-upload-btn:hover { background: var(--p); color: #fff; border-color: var(--p); }

                .icons-count { font-size: 0.75rem; color: var(--t3); white-space: nowrap; }

                .icons-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
                    gap: 10px;
                }

                .icon-mgmt-card {
                    background: #fff;
                    border: 1px solid var(--bd);
                    border-radius: var(--r-lg);
                    padding: 14px 10px 10px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                    position: relative;
                    transition: border-color var(--tr), box-shadow var(--tr);
                }

                .icon-mgmt-card:hover {
                    border-color: var(--bd-hi);
                    box-shadow: var(--sh-sm);
                }

                .icon-mgmt-card:hover .icon-mgmt-actions { opacity: 1; }

                .icon-mgmt-img {
                    width: 48px;
                    height: 48px;
                    object-fit: contain;
                    cursor: zoom-in;
                    border-radius: 4px;
                    transition: transform 0.15s ease, box-shadow 0.15s ease;
                }

                .icon-mgmt-img:hover {
                    transform: scale(1.15);
                    box-shadow: var(--sh-sm);
                }

                .icon-mgmt-name {
                    font-family: 'Fira Code', monospace;
                    font-size: 0.65rem;
                    color: var(--t2);
                    text-align: center;
                    word-break: break-all;
                    line-height: 1.3;
                    cursor: text;
                    padding: 1px 4px;
                    border-radius: 4px;
                    border: 1px solid transparent;
                    transition: border-color var(--tr), background var(--tr);
                    max-width: 100%;
                }

                .icon-mgmt-name:hover { border-color: var(--bd); background: var(--s0); }

                .icon-mgmt-name-input {
                    font-family: 'Fira Code', monospace;
                    font-size: 0.65rem;
                    color: var(--t1);
                    text-align: center;
                    word-break: break-all;
                    width: 100%;
                    border: 1px solid var(--bd-hi);
                    border-radius: 4px;
                    padding: 2px 4px;
                    outline: none;
                    background: var(--p-dim);
                    box-shadow: 0 0 0 2px var(--p-glow);
                }

                .icon-mgmt-actions {
                    display: flex;
                    gap: 4px;
                    opacity: 0;
                    transition: opacity var(--tr);
                }

                .icon-mgmt-del {
                    padding: 3px 8px;
                    border-radius: var(--r-sm);
                    border: 1px solid var(--red-bd);
                    background: var(--red-bg);
                    color: var(--red);
                    font-size: 0.68rem;
                    font-weight: 700;
                    cursor: pointer;
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    transition: var(--tr);
                }

                .icon-mgmt-del:hover { background: var(--red); color: #fff; }

                .icons-empty {
                    grid-column: 1/-1;
                    padding: 50px 0;
                    text-align: center;
                    color: var(--t3);
                    font-size: 0.88rem;
                }

                /* ── Lightbox ── */
                .lb-overlay {
                    display: none;
                    position: fixed;
                    inset: 0;
                    background: rgba(10,12,24,0.82);
                    z-index: 300;
                    backdrop-filter: blur(4px);
                }

                .lb-overlay.open { display: block; }

                .lb-modal {
                    display: none;
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    z-index: 301;
                    background: #fff;
                    border-radius: var(--r-lg);
                    box-shadow: var(--sh-lg);
                    max-width: min(600px, 92vw);
                    width: 100%;
                    flex-direction: column;
                    overflow: hidden;
                }

                .lb-modal.open { display: flex; }

                .lb-close {
                    position: absolute;
                    top: 10px; right: 10px;
                    width: 30px; height: 30px;
                    border-radius: 50%;
                    border: 1px solid var(--bd);
                    background: #fff;
                    color: var(--t2);
                    font-size: 0.78rem;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 2;
                    transition: var(--tr);
                }

                .lb-close:hover { background: var(--s1); color: var(--t1); }

                .lb-arrow {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 34px; height: 34px;
                    border-radius: 50%;
                    border: 1px solid var(--bd);
                    background: rgba(255,255,255,0.9);
                    color: var(--t1);
                    font-size: 1.3rem;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 2;
                    transition: var(--tr);
                    line-height: 1;
                }

                .lb-arrow:hover { background: #fff; box-shadow: var(--sh-md); }
                .lb-arrow:disabled { opacity: 0.3; cursor: default; }
                .lb-prev { left: 10px; }
                .lb-next { right: 10px; }

                .lb-img-wrap {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: var(--s0);
                    padding: 24px;
                    min-height: 280px;
                }

                .lb-img-wrap img {
                    max-width: 100%;
                    max-height: 65vh;
                    object-fit: contain;
                    border-radius: 6px;
                    box-shadow: var(--sh-md);
                }

                .lb-footer {
                    padding: 12px 16px;
                    border-top: 1px solid var(--bd-sm);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    background: #fff;
                }

                .lb-info { display: flex; flex-direction: column; gap: 2px; min-width: 0; }

                .lb-serial {
                    font-family: 'Fira Code', monospace;
                    font-size: 0.9rem;
                    font-weight: 500;
                    color: var(--t1);
                }

                .lb-type {
                    font-size: 0.7rem;
                    color: var(--t3);
                    text-transform: capitalize;
                }

                .lb-actions { display: flex; gap: 6px; flex-shrink: 0; }

                .lb-toggle, .lb-copy {
                    padding: 5px 12px;
                    border-radius: var(--r-md);
                    font-size: 0.75rem;
                    font-weight: 700;
                    cursor: pointer;
                    border: 1px solid var(--bd);
                    background: var(--s1);
                    color: var(--t2);
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    transition: var(--tr);
                    white-space: nowrap;
                }

                .lb-toggle:hover, .lb-copy:hover { background: var(--s2); color: var(--t1); }
                .wbtn-success { background: var(--green); color: white; font-weight: 700; box-shadow: 0 2px 6px rgba(5,150,105,0.2); }
                .wbtn-success:hover { opacity: 0.9; box-shadow: var(--sh-md); }

                .wizard-error { color: var(--red); font-size: 0.78rem; font-weight: 600; }

                .wizard-success-box { text-align: center; padding: 36px 24px; }
                .wizard-success-box .success-icon { font-size: 2.2rem; margin-bottom: 12px; display: block; }
                .wizard-success-box h3 { font-size: 1.05rem; font-weight: 800; color: var(--green); margin-bottom: 7px; letter-spacing: -0.02em; }
                .wizard-success-box p { color: var(--t2); font-size: 0.84rem; }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="header-dot"></div>
                <h1>MayGraph Cards &mdash; Dashboard</h1>
                <div class="header-nav">
                    <button class="nav-btn active" id="btn-overview" onclick="showOverview()">Overview</button>
                    <button class="nav-btn" id="btn-browse" onclick="showBrowse()">Browse Cards</button>
                    <button class="nav-btn" id="btn-icons" onclick="showIcons()">Icons</button>
                </div>
                <button class="btn-restart" id="btn-restart" onclick="doRestart()" title="Restart the dashboard server">
                    <span class="btn-restart-icon">&#x21BA;</span> Restart
                </button>
                <span class="header-count" id="header-count">Loading&hellip;</span>
            </div>

            <div class="restart-overlay" id="restart-overlay">
                <div class="restart-box">
                    <h3>Restarting server&hellip;</h3>
                    <p id="restart-overlay-status">Sending restart request&hellip;</p>
                    <div class="restart-spinner"></div>
                </div>
            </div>

            <div class="main">
                <div class="sidebar">
                    <button class="new-card-btn" onclick="showWizard()">
                        <span class="plus">+</span> New Card Type
                    </button>
                    <div class="sidebar-search-wrap">
                        <input class="sidebar-search" id="sidebar-search" type="search"
                               placeholder="Search card types…" oninput="filterSidebar()" autocomplete="off" />
                    </div>
                    <div class="sidebar-label-row">
                        <div class="sidebar-label">Card Types</div>
                        <button class="new-group-btn" onclick="openGroupModal()" title="Create a new group">+ Group</button>
                    </div>
                    <div id="card-list"></div>
                    <div style="margin-top:auto">
                        <button class="generate-btn" onclick="openGenModal()">
                            <span class="gen-arrow">&#9654;</span> Generate Cards
                        </button>
                    </div>
                </div>
                <div class="content" id="content">
                    <div class="placeholder"><div class="placeholder-arrow">&#8635;</div><div>Loading&hellip;</div></div>
                </div>
            </div>

            <!-- Browse hover preview -->
            <div id="card-hover-preview"><img id="card-hover-img" src="" alt="" /></div>

            <!-- Group assign dropdown (shared, repositioned per card) -->
            <div class="group-assign-panel" id="group-assign-panel"></div>

            <!-- Group management modal -->
            <div class="grp-overlay" id="grp-overlay" onclick="closeGroupModal()"></div>
            <div class="grp-modal" id="grp-modal">
                <div class="grp-modal-header">
                    <h3 id="grp-modal-title">New Group</h3>
                    <button class="grp-modal-close" onclick="closeGroupModal()">&#10005;</button>
                </div>
                <div class="grp-modal-body">
                    <div class="grp-field">
                        <label>Group name</label>
                        <input type="text" id="grp-name-input" placeholder="E.g. Education"
                               onkeydown="if(event.key==='Enter') submitGroupModal()" />
                        <div class="grp-error" id="grp-error"></div>
                    </div>
                </div>
                <div class="grp-modal-footer">
                    <button class="wbtn wbtn-ghost" onclick="closeGroupModal()">Cancel</button>
                    <button class="wbtn wbtn-primary" id="grp-submit-btn" onclick="submitGroupModal()">Create</button>
                </div>
            </div>

            <!-- Lightbox -->
            <div class="lb-overlay" id="lb-overlay" onclick="closeLightbox()"></div>
            <div class="lb-modal" id="lb-modal">
                <button class="lb-close" onclick="closeLightbox()">&#10005;</button>
                <button class="lb-arrow lb-prev" id="lb-prev" onclick="lbNav(-1)">&#8249;</button>
                <button class="lb-arrow lb-next" id="lb-next" onclick="lbNav(1)">&#8250;</button>
                <div class="lb-img-wrap">
                    <img id="lb-img" src="" alt="" />
                </div>
                <div class="lb-footer">
                    <div class="lb-info">
                        <span class="lb-serial" id="lb-serial"></span>
                        <span class="lb-type" id="lb-type"></span>
                    </div>
                    <div class="lb-actions">
                        <button class="lb-toggle" id="lb-toggle" onclick="lbToggleVersion()" style="display:none">
                            Switch to Extended
                        </button>
                        <button class="lb-copy" onclick="lbCopySerial()">Copy serial</button>
                    </div>
                </div>
            </div>

            <!-- Generate Cards modal -->
            <div class="gen-overlay" id="gen-overlay" onclick="closeGenModal()"></div>
            <div class="gen-modal" id="gen-modal">
                <!-- Preview state -->
                <div id="gen-preview-view">
                    <div class="gen-modal-header">
                        <h2>Generate Cards</h2>
                        <p id="gen-header-sub">Analyzing your CSV data&hellip;</p>
                    </div>
                    <div class="gen-modal-body">
                        <div class="gen-stat-row">
                            <span class="gen-stat-dot green"></span>
                            <span class="gen-stat-label">Up to date</span>
                            <span class="gen-stat-value" id="gen-existing">&mdash;</span>
                        </div>
                        <div class="gen-stat-row">
                            <span class="gen-stat-dot blue"></span>
                            <span class="gen-stat-label">New cards to create</span>
                            <span class="gen-stat-value" id="gen-new">&mdash;</span>
                        </div>
                        <div class="gen-stat-row">
                            <span class="gen-stat-dot orange"></span>
                            <span class="gen-stat-label">Cards to update</span>
                            <span class="gen-stat-value" id="gen-updated">&mdash;</span>
                        </div>
                    </div>
                    <div id="gen-warning" style="display:none" class="gen-warning">
                        <strong>&#9888; Unrecognized CSV files:</strong>
                        <ul id="gen-warning-list"></ul>
                        <small>Check delimiter (must be &lsquo;<strong>;</strong>&rsquo;) and filename &mdash; expected format: <code>my-card.csv</code></small>
                    </div>
                    <div class="gen-modal-footer">
                        <button class="gen-btn" onclick="closeGenModal()">Cancel</button>
                        <button class="gen-btn primary" id="gen-confirm-btn" onclick="startGeneration()" disabled>Generate</button>
                    </div>
                </div>
                <!-- Progress state -->
                <div id="gen-progress-view" style="display:none">
                    <div class="gen-modal-header">
                        <h2>Generating Cards&hellip;</h2>
                        <p id="gen-progress-sub">Starting&hellip;</p>
                    </div>
                    <div class="gen-modal-body">
                        <div class="gen-progress-wrap">
                            <div class="gen-progress-fill" id="gen-bar"></div>
                        </div>
                        <div class="gen-progress-label" id="gen-progress-label">0 / 0</div>
                        <div class="gen-progress-card" id="gen-progress-card">&nbsp;</div>
                    </div>
                </div>
                <!-- Complete state -->
                <div id="gen-complete-view" style="display:none">
                    <div class="gen-modal-header">
                        <h2 id="gen-complete-title">Generation Complete</h2>
                    </div>
                    <div class="gen-modal-body">
                        <div class="gen-complete-icon">&#10003;</div>
                        <div class="gen-complete-stats">
                            <div class="gen-complete-stat">
                                <span>Cards generated</span>
                                <span id="gen-done-count">0</span>
                            </div>
                            <div class="gen-complete-stat">
                                <span>Skipped (up to date)</span>
                                <span id="gen-skip-count">0</span>
                            </div>
                        </div>
                        <div id="gen-error-msg" class="gen-error-msg" style="display:none"></div>
                    </div>
                    <div class="gen-modal-footer">
                        <button class="gen-btn primary" onclick="closeGenModal()">Close</button>
                    </div>
                </div>
            </div>

            <script>
                let cards = [];
                let selectedIndex = -1;
                let groups = [];               // CardGroup[] loaded from /api/groups
                let collapsedGroups = new Set(); // group names that are collapsed
                let sidebarQuery = '';         // current sidebar search query

                async function init() {
                    const [cardsRes, groupsRes] = await Promise.all([fetch('/api/cards'), fetch('/api/groups')]);
                    cards = await cardsRes.json();
                    groups = await groupsRes.json();
                    document.getElementById('header-count').textContent =
                        cards.length + ' card type' + (cards.length !== 1 ? 's' : '');
                    renderSidebar();
                    showOverview();
                }

                function _cardGroupName(card) {
                    // Returns the group name for a card, or null if ungrouped.
                    const g = groups.find(g => g.types.includes(card.name));
                    return g ? g.name : null;
                }

                function filterSidebar() {
                    sidebarQuery = (document.getElementById('sidebar-search')?.value || '').trim().toLowerCase();
                    renderSidebar();
                }

                function renderSidebar() {
                    const query = sidebarQuery;
                    const visibleCards = query
                        ? cards.filter(c => (c.displayName || c.name).toLowerCase().includes(query))
                        : cards;

                    if (query) {
                        // Flat filtered list — no group structure when searching
                        document.getElementById('card-list').innerHTML = visibleCards.length === 0
                            ? `<div class="ungrouped-label" style="opacity:0.5;font-style:italic">No results</div>`
                            : visibleCards.map(c => {
                                const i = cards.indexOf(c);
                                return `<div class="card-item ${i === selectedIndex ? 'active' : ''}" onclick="selectCard(${i})">
                                    <span class="card-item-name">${c.displayName || c.name}</span>
                                    <span class="card-item-badge">${c.properties.length}</span>
                                </div>`;
                            }).join('');
                        return;
                    }

                    // Group-aware rendering
                    let html = '';

                    // Render each group
                    for (const group of groups) {
                        const groupCards = group.types
                            .map(typeName => { const idx = cards.findIndex(c => c.name === typeName); return idx >= 0 ? { card: cards[idx], idx } : null; })
                            .filter(Boolean);
                        const isOpen = !collapsedGroups.has(group.name);
                        const gname = _escHtml(group.name);
                        html += `<div class="group-section">
                            <div class="group-header" onclick="toggleGroup('${gname}')">
                                <span class="group-chevron ${isOpen ? 'open' : ''}">&#9654;</span>
                                <span class="group-name">${gname}</span>
                                <span class="group-count">${groupCards.length}</span>
                                <div class="group-actions" onclick="event.stopPropagation()">
                                    <button class="group-action-btn" onclick="openGroupModal('${gname}')" title="Rename group">&#9998;</button>
                                    <button class="group-action-btn danger" onclick="confirmDeleteGroup('${gname}')" title="Delete group">&#128465;</button>
                                </div>
                            </div>`;
                        if (isOpen) {
                            html += `<div class="group-items">`;
                            if (groupCards.length === 0) {
                                html += `<div class="ungrouped-label" style="padding-left:28px;font-style:italic;opacity:0.5">Empty group</div>`;
                            }
                            for (const { card: c, idx: i } of groupCards) {
                                html += `<div class="card-item ${i === selectedIndex ? 'active' : ''}" onclick="selectCard(${i})">
                                    <span class="card-item-name">${c.displayName || c.name}</span>
                                    <span class="card-item-badge">${c.properties.length}</span>
                                </div>`;
                            }
                            html += `</div>`;
                        }
                        html += `</div>`;
                    }

                    // Ungrouped
                    const groupedNames = new Set(groups.flatMap(g => g.types));
                    const ungrouped = cards.map((c, i) => ({ c, i })).filter(({ c }) => !groupedNames.has(c.name));
                    if (ungrouped.length > 0) {
                        if (groups.length > 0) html += `<div class="ungrouped-label">Ungrouped</div>`;
                        for (const { c, i } of ungrouped) {
                            html += `<div class="card-item ${i === selectedIndex ? 'active' : ''}" onclick="selectCard(${i})">
                                <span class="card-item-name">${c.displayName || c.name}</span>
                                <span class="card-item-badge">${c.properties.length}</span>
                            </div>`;
                        }
                    }

                    document.getElementById('card-list').innerHTML = html;
                }

                function toggleGroup(name) {
                    if (collapsedGroups.has(name)) collapsedGroups.delete(name);
                    else collapsedGroups.add(name);
                    renderSidebar();
                }

                function _escHtml(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }

                // ── Group management modal ─────────────────────────────────────
                let _grpEditName = null; // null = create mode, string = rename mode

                function openGroupModal(editName) {
                    _grpEditName = editName || null;
                    const title   = document.getElementById('grp-modal-title');
                    const input   = document.getElementById('grp-name-input');
                    const btn     = document.getElementById('grp-submit-btn');
                    const errEl   = document.getElementById('grp-error');
                    title.textContent = editName ? `Rename "${editName}"` : 'New Group';
                    input.value       = editName || '';
                    btn.textContent   = editName ? 'Rename' : 'Create';
                    errEl.textContent = '';
                    document.getElementById('grp-overlay').classList.add('open');
                    setTimeout(() => {
                        document.getElementById('grp-modal').classList.add('open');
                        input.focus();
                        input.select();
                    }, 10);
                }

                function closeGroupModal() {
                    document.getElementById('grp-modal').classList.remove('open');
                    document.getElementById('grp-overlay').classList.remove('open');
                }

                async function submitGroupModal() {
                    const name  = document.getElementById('grp-name-input').value.trim();
                    const errEl = document.getElementById('grp-error');
                    if (!name) { errEl.textContent = 'Name is required.'; return; }
                    const btn = document.getElementById('grp-submit-btn');
                    btn.disabled = true;

                    try {
                        let res;
                        if (_grpEditName) {
                            res = await fetch('/api/groups/' + encodeURIComponent(_grpEditName), {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ newName: name }),
                            });
                        } else {
                            res = await fetch('/api/groups', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ name }),
                            });
                        }
                        const data = await res.json();
                        if (!res.ok) { errEl.textContent = data.message || 'Error.'; btn.disabled = false; return; }
                        groups = data;
                        closeGroupModal();
                        // If triggered from the card detail "Create new group…" option, assign the card
                        if (_pendingAssignCard) {
                            const assignCard = _pendingAssignCard;
                            _pendingAssignCard = null;
                            await doAssignCardGroup(assignCard, name);
                        } else {
                            renderSidebar();
                            showOverview();
                        }
                    } catch { errEl.textContent = 'Network error.'; btn.disabled = false; }
                }

                async function confirmDeleteGroup(name) {
                    if (!confirm(`Delete group "${name}"? Card types in this group will become ungrouped.`)) return;
                    const res   = await fetch('/api/groups/' + encodeURIComponent(name), { method: 'DELETE' });
                    groups = await res.json();
                    renderSidebar();
                    showOverview();
                }

                async function assignCardToGroup(cardName, groupName) {
                    const res = await fetch('/api/groups/' + encodeURIComponent(groupName), {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ addType: cardName }),
                    });
                    groups = await res.json();
                    renderSidebar();
                }

                async function removeCardFromGroup(cardName) {
                    for (const g of groups) {
                        if (g.types.includes(cardName)) {
                            const res = await fetch('/api/groups/' + encodeURIComponent(g.name), {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ removeType: cardName }),
                            });
                            groups = await res.json();
                            renderSidebar();
                            return;
                        }
                    }
                }

                // ── Group assign button (in card detail view) ─────────────────
                function _buildGroupAssignBtn(cardName) {
                    const current = (groups.find(g => g.types.includes(cardName)) || {}).name || null;
                    const label   = current ? `&#128193; ${_escHtml(current)}` : '&#128193; Group';
                    const cls     = current ? 'group-assign-btn assigned' : 'group-assign-btn';
                    return `<button id="btn-group-assign" class="${cls}"
                                onclick="openGroupAssignPanel('${_escHtml(cardName)}', this)">
                                ${label} &#9662;
                            </button>`;
                }

                let _gapCardName = '';
                let _gapCloseHandler = null;

                function openGroupAssignPanel(cardName, btn) {
                    closeGroupAssignPanel();
                    _gapCardName = cardName;
                    const panel = document.getElementById('group-assign-panel');
                    const current = (groups.find(g => g.types.includes(cardName)) || {}).name || null;

                    // Build items
                    let html = '';
                    if (groups.length === 0) {
                        html += `<div class="group-assign-empty">No groups yet</div>`;
                    } else {
                        for (const g of groups) {
                            const isCurrent = g.name === current;
                            html += `<div class="group-assign-item ${isCurrent ? 'active' : ''}"
                                         onclick="doAssignCardGroup('${_escHtml(cardName)}', '${_escHtml(g.name)}')">
                                         <span class="gap-check">${isCurrent ? '✓' : ''}</span>
                                         ${_escHtml(g.name)}
                                     </div>`;
                        }
                    }
                    html += `<div class="group-assign-divider"></div>`;
                    html += `<div class="group-assign-item new-group"
                                 onclick="openGroupModalThenAssign('${_escHtml(cardName)}')">
                                 <span class="gap-check">+</span> Create new group…
                             </div>`;
                    if (current) {
                        html += `<div class="group-assign-divider"></div>`;
                        html += `<div class="group-assign-item remove-group"
                                     onclick="doRemoveCardGroup('${_escHtml(cardName)}')">
                                     <span class="gap-check">×</span> Remove from group
                                 </div>`;
                    }
                    panel.innerHTML = html;

                    // Position below the button
                    const rect  = btn.getBoundingClientRect();
                    const pw    = 210;
                    let left    = rect.left;
                    if (left + pw > window.innerWidth - 8) left = rect.right - pw;
                    panel.style.left = left + 'px';
                    panel.style.top  = (rect.bottom + 4) + 'px';
                    panel.classList.add('open');

                    // Close on outside click
                    setTimeout(() => {
                        _gapCloseHandler = e => {
                            if (!panel.contains(e.target) && e.target !== btn)
                                closeGroupAssignPanel();
                        };
                        document.addEventListener('click', _gapCloseHandler);
                    }, 0);
                }

                function closeGroupAssignPanel() {
                    const panel = document.getElementById('group-assign-panel');
                    panel.classList.remove('open');
                    if (_gapCloseHandler) {
                        document.removeEventListener('click', _gapCloseHandler);
                        _gapCloseHandler = null;
                    }
                }

                async function doAssignCardGroup(cardName, groupName) {
                    closeGroupAssignPanel();
                    const res = await fetch('/api/groups/' + encodeURIComponent(groupName), {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ addType: cardName }),
                    });
                    groups = await res.json();
                    renderSidebar();
                    _refreshGroupBtn(cardName);
                }

                async function doRemoveCardGroup(cardName) {
                    closeGroupAssignPanel();
                    for (const g of groups) {
                        if (g.types.includes(cardName)) {
                            const res = await fetch('/api/groups/' + encodeURIComponent(g.name), {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ removeType: cardName }),
                            });
                            groups = await res.json();
                            renderSidebar();
                            _refreshGroupBtn(cardName);
                            return;
                        }
                    }
                }

                function _refreshGroupBtn(cardName) {
                    const btn = document.getElementById('btn-group-assign');
                    if (!btn) return;
                    const current = (groups.find(g => g.types.includes(cardName)) || {}).name || null;
                    btn.className   = current ? 'group-assign-btn assigned' : 'group-assign-btn';
                    btn.innerHTML   = (current ? `&#128193; ${_escHtml(current)}` : '&#128193; Group') + ' &#9662;';
                }

                // Opens group creation modal, then assigns once created
                let _pendingAssignCard = null;
                function openGroupModalThenAssign(cardName) {
                    closeGroupAssignPanel();
                    _pendingAssignCard = cardName;
                    openGroupModal();
                }

                function showOverview() {
                    selectedIndex = -1;
                    renderSidebar();
                    _setNavActive('btn-overview');

                    function propsSection(list, cls, label) {
                        if (!list.length) return '';
                        return `<div class="overview-props-section">
                            <div class="overview-props-label ${cls}">${label}</div>
                            <div class="prop-tags">
                                ${list.map(p => `<span class="prop-tag ${cls}">${p.displayName || p.name}</span>`).join('')}
                            </div>
                        </div>`;
                    }

                    function cardHtml(c, i) {
                        const req = c.properties.filter(p => !p.isOptional);
                        const opt = c.properties.filter(p =>  p.isOptional);
                        const img = c.mockupImageShort
                            ? `<div class="overview-mockup"><img src="${c.mockupImageShort}" alt="${c.name} card preview" loading="lazy" /></div>`
                            : `<div class="overview-mockup"><div class="overview-mockup-placeholder">No preview available</div></div>`;
                        return `<div class="overview-card" onclick="selectCard(${i})">
                            <div class="overview-card-header">
                                <span class="overview-card-title">${c.displayName || c.name} Card</span>
                                <div class="overview-card-badges">
                                    <span class="badge badge-count">${c.properties.length}</span>
                                    <span class="badge ${c.isExtendable ? 'badge-ext' : 'badge-fixed'}">
                                        ${c.isExtendable ? 'Extendable' : 'Fixed'}
                                    </span>
                                </div>
                            </div>
                            ${img}
                            <div class="overview-props">
                                ${propsSection(req, 'req', 'Required')}
                                ${propsSection(opt, 'opt', 'Optional')}
                            </div>
                        </div>`;
                    }

                    function sectionHtml(title, cardItems, showGroupHeader) {
                        if (cardItems.length === 0) return '';
                        const gridCards = cardItems.map(({ c, i }) => cardHtml(c, i)).join('');
                        if (!showGroupHeader) return `<div class="overview-grid">${gridCards}</div>`;
                        return `<div class="overview-group-section">
                            <div class="overview-group-header">
                                <span class="overview-group-title">${_escHtml(title)}</span>
                                <span class="overview-group-count">${cardItems.length}</span>
                            </div>
                            <div class="overview-grid">${gridCards}</div>
                        </div>`;
                    }

                    const groupedNames = new Set(groups.flatMap(g => g.types));
                    const hasGroups = groups.length > 0;
                    let html = '';

                    if (!hasGroups) {
                        const all = cards.map((c, i) => ({ c, i }));
                        html = sectionHtml('', all, false);
                    } else {
                        for (const group of groups) {
                            const groupCards = group.types
                                .map(typeName => { const i = cards.findIndex(c => c.name === typeName); return i >= 0 ? { c: cards[i], i } : null; })
                                .filter(Boolean);
                            html += sectionHtml(group.name, groupCards, true);
                        }
                        const ungrouped = cards.map((c, i) => ({ c, i })).filter(({ c }) => !groupedNames.has(c.name));
                        if (ungrouped.length > 0) html += sectionHtml('Ungrouped', ungrouped, true);
                    }

                    document.getElementById('content').innerHTML = `<div>${html}</div>`;
                }

                function selectCard(i) {
                    selectedIndex = i;
                    renderSidebar();
                    document.getElementById('btn-overview').classList.remove('active');

                    const c = cards[i];
                    const req = c.properties.filter(p => !p.isOptional);
                    const opt = c.properties.filter(p =>  p.isOptional);

                    function propsHtml(list, cls) {
                        return list.map(p =>
                            `<div class="prop">
                                <div class="prop-name">${p.displayName || p.name}</div>
                                <div class="prop-type ${cls}">${cls === 'req' ? 'Required' : 'Optional'}</div>
                            </div>`
                        ).join('');
                    }

                    let mockup = '';
                    if (c.isExtendable && c.mockupImageShort && c.mockupImageExtended) {
                        mockup = `<div class="detail-mockup">
                            <img src="${c.mockupImageShort}" alt="${c.name} shortened version" />
                            <img src="${c.mockupImageExtended}" alt="${c.name} extended version" />
                        </div>`;
                    } else if (c.mockupImageShort) {
                        mockup = `<div class="detail-mockup single"><img src="${c.mockupImageShort}" alt="${c.name} card preview" /></div>`;
                    }

                    document.getElementById('content').innerHTML = `
                        <div class="detail">
                            <div class="detail-back" onclick="showOverview()">&#8592; Overview</div>
                            <div class="detail-header">
                                <div class="detail-header-top">
                                    <div>
                                        <div class="detail-title">${c.displayName || c.name} Card</div>
                                        <div class="detail-badges">
                                            <span class="badge badge-count">${c.properties.length} propert${c.properties.length !== 1 ? 'ies' : 'y'}</span>
                                            <span class="badge ${c.isExtendable ? 'badge-ext' : 'badge-fixed'}">
                                                ${c.isExtendable ? 'Extendable' : 'Fixed'}
                                            </span>
                                        </div>
                                        <div class="detail-csv-hint">Expected CSV: <code>${c.expectedCsvFilename}</code></div>
                                    </div>
                                    <div style="display:flex;gap:10px;flex-shrink:0;flex-wrap:wrap;justify-content:flex-end;">
                                        ${_buildGroupAssignBtn(c.name)}
                                        <button class="modify-card-btn" onclick="showModifyWizard('${c.name}')">&#9998; Modify</button>
                                        <button class="delete-card-btn" onclick="deleteCard('${c.name}')">&#128465; Delete</button>
                                    </div>
                                </div>
                                ${mockup}
                            </div>
                            ${req.length ? `
                            <div class="section">
                                <div class="section-header required">Required &mdash; ${req.length}</div>
                                <div class="props-grid">${propsHtml(req, 'req')}</div>
                            </div>` : ''}
                            ${opt.length ? `
                            <div class="section">
                                <div class="section-header optional">Optional &mdash; ${opt.length}</div>
                                <div class="props-grid">${propsHtml(opt, 'opt')}</div>
                            </div>` : ''}
                        </div>`;
                }

                // ── Wizard ──────────────────────────────────────────────────
                let existingProps = [];
                let existingPropIcons = {}; // propName → iconFile from all existing card types
                let wz = {};

                function toDisplayName(name) {
                    return name.replace(/([a-z])([A-Z])/g, '$1 $2');
                }

                function resetWizard() {
                    wz = { step: 1, isModify: false, originalName: '',
                           name: '', isExtendable: false,
                           fixedRequired: ['Serial Number'], fixedOptional: [],
                           extendedRequired: [], extendedOptional: [],
                           icons: { 'Serial Number': 'notes.png' },
                           group: null,       // null = no change/no group, '' = no group, 'GroupName' = assign
                           newGroupName: '' };// used when group === '__new__'
                }

                async function showWizard() {
                    selectedIndex = -1;
                    renderSidebar();
                    document.getElementById('btn-overview').classList.remove('active');
                    resetWizard();
                    if (existingProps.length === 0) {
                        const r = await fetch('/api/existing-properties');
                        existingProps = await r.json();
                    }
                    if (Object.keys(existingPropIcons).length === 0) {
                        const r = await fetch('/api/existing-property-icons');
                        existingPropIcons = await r.json();
                    }
                    renderWizard();
                }

                async function showModifyWizard(name) {
                    selectedIndex = cards.findIndex(c => c.name === name);
                    renderSidebar();
                    document.getElementById('btn-overview').classList.remove('active');
                    if (existingProps.length === 0) {
                        const r = await fetch('/api/existing-properties');
                        existingProps = await r.json();
                    }
                    if (Object.keys(existingPropIcons).length === 0) {
                        const r = await fetch('/api/existing-property-icons');
                        existingPropIcons = await r.json();
                    }
                    const r = await fetch('/api/card-type/' + encodeURIComponent(name));
                    if (!r.ok) { alert('Could not load card type details.'); return; }
                    const details = await r.json();
                    const currentGroup = (groups.find(g => g.types.includes(name)) || {}).name || '';
                    wz = {
                        step: 1, isModify: true, originalName: name,
                        name: toDisplayName(details.name), isExtendable: details.isExtendable,
                        fixedRequired:    details.fixedRequired.map(toDisplayName),
                        fixedOptional:    details.fixedOptional.map(toDisplayName),
                        extendedRequired: details.extendedRequired.map(toDisplayName),
                        extendedOptional: details.extendedOptional.map(toDisplayName),
                        icons: Object.fromEntries(
                            Object.entries(details.icons).map(([k, v]) => [toDisplayName(k), v])
                        ),
                        group: currentGroup,
                        newGroupName: '',
                    };
                    renderWizard();
                }

                function renderWizard() {
                    // +1 for the Group step at the end
                    const totalSteps = wz.isExtendable ? 5 : 4;
                    const stepLabels = wz.isExtendable
                        ? ['Name', 'Type', 'Attrs (Fixed)', 'Attrs (Extended)', 'Group']
                        : ['Name', 'Type', 'Attributes', 'Group'];

                    // Build step indicator
                    let stepsHtml = '';
                    for (let i = 0; i < totalSteps; i++) {
                        const state = wz.step > i + 1 ? 'done' : wz.step === i + 1 ? 'active' : '';
                        stepsHtml += `<div class="wstep ${state}">
                            <div class="wstep-dot">${wz.step > i + 1 ? '✓' : i + 1}</div>
                            <span>${stepLabels[i]}</span>
                        </div>`;
                        if (i < totalSteps - 1) {
                            stepsHtml += `<div class="wstep-line ${wz.step > i + 1 ? 'done' : ''}"></div>`;
                        }
                    }

                    let bodyHtml = '';
                    let title = '', subtitle = '';

                    if (wz.step === 1) {
                        title = 'Card type name';
                        subtitle = 'Used to identify the card type (e.g. Industry, Government…)';
                        bodyHtml = `
                            <div class="wfield">
                                <label>Name</label>
                                <input type="text" id="w-name" value="${wz.name}" placeholder="E.g. Industry"
                                    oninput="wz.name = this.value"
                                    onkeydown="if(event.key==='Enter') wizardNext()" />
                            </div>`;

                    } else if (wz.step === 2) {
                        title = 'Card type';
                        subtitle = 'An Extendable card has a short version and a long version with additional attributes.';
                        bodyHtml = `
                            <div class="type-options">
                                <div class="type-option ${!wz.isExtendable ? 'selected' : ''}" onclick="wz.isExtendable=false; document.querySelectorAll('.type-option').forEach((e,i)=>e.classList.toggle('selected',i===0))">
                                    <div class="type-option-title">Fixed</div>
                                    <div class="type-option-desc">Single version of the card.</div>
                                </div>
                                <div class="type-option ${wz.isExtendable ? 'selected' : ''}" onclick="wz.isExtendable=true; document.querySelectorAll('.type-option').forEach((e,i)=>e.classList.toggle('selected',i===1))">
                                    <div class="type-option-title">Extendable</div>
                                    <div class="type-option-desc">Short version + long version with additional attributes.</div>
                                </div>
                            </div>`;

                    } else if (wz.step === 3) {
                        const isExtStep = wz.isExtendable;
                        title = isExtStep ? 'Attributes — Fixed version' : 'Attributes';
                        subtitle = isExtStep
                            ? 'These attributes appear in both versions (Fixed and Extended).'
                            : 'Define the attributes for this card type.';
                        bodyHtml = attrPickerHtml('fixedRequired', 'fixedOptional');

                    } else if (wz.step === 4 && wz.isExtendable) {
                        title = 'Attributes — Extended version';
                        subtitle = 'These attributes appear only in the Extended version.';
                        bodyHtml = attrPickerHtml('extendedRequired', 'extendedOptional');

                    } else {
                        // Group step (step 4 for fixed, step 5 for extendable)
                        title = 'Group (optional)';
                        subtitle = 'Organise card types into groups for easier navigation. You can skip this step.';
                        const sel = wz.group || '';
                        const groupOpts = groups.map(g =>
                            `<option value="${_escHtml(g.name)}" ${sel === g.name ? 'selected' : ''}>${_escHtml(g.name)}</option>`
                        ).join('');
                        bodyHtml = `
                            <div class="wfield">
                                <label>Assign to group</label>
                                <select id="w-group" style="width:100%;height:36px;border:1px solid var(--bd);border-radius:var(--r-md);padding:0 10px;font-size:0.84rem;font-family:inherit;color:var(--t1);background:var(--s0);outline:none;"
                                    onchange="wz.group=this.value; document.getElementById('w-new-group-wrap').style.display=this.value==='__new__'?'':'none'">
                                    <option value="" ${!sel ? 'selected' : ''}>No group</option>
                                    ${groupOpts}
                                    <option value="__new__" ${sel === '__new__' ? 'selected' : ''}>+ Create new group…</option>
                                </select>
                            </div>
                            <div id="w-new-group-wrap" style="display:${sel === '__new__' ? '' : 'none'}">
                                <div class="wfield" style="margin-top:12px">
                                    <label>New group name</label>
                                    <input type="text" id="w-new-group-name" value="${_escHtml(wz.newGroupName || '')}"
                                           placeholder="E.g. Education"
                                           oninput="wz.newGroupName = this.value"
                                           onkeydown="if(event.key==='Enter') wizardCreate()" />
                                </div>
                            </div>`;
                    }

                    // Footer buttons
                    let footerLeft = wz.step > 1
                        ? `<button class="wbtn wbtn-ghost" onclick="wizardBack()">← Back</button>` : '';
                    let footerRight = '';
                    const isLastStep = wz.step === totalSteps;
                    if (isLastStep) {
                        const btnLabel = wz.isModify ? 'Save changes' : 'Create card type';
                        footerRight = `<button class="wbtn wbtn-success" onclick="wizardCreate()">${btnLabel}</button>`;
                    } else {
                        footerRight = `<button class="wbtn wbtn-primary" onclick="wizardNext()">Next →</button>`;
                    }

                    const backAction = wz.isModify
                        ? `selectCard(${cards.findIndex(c => c.name === wz.originalName)})`
                        : 'showOverview()';
                    const backLabel = wz.isModify ? `← ${wz.originalName} Card` : '← Overview';
                    document.getElementById('content').innerHTML = `
                        <div class="wizard">
                            <div class="detail-back" onclick="${backAction}">${backLabel}</div>
                            <div class="wizard-steps">${stepsHtml}</div>
                            <div class="wizard-card">
                                <div class="wizard-card-header">
                                    <h2>${title}</h2>
                                    <p>${subtitle}</p>
                                </div>
                                <div class="wizard-card-body">${bodyHtml}</div>
                                <div class="wizard-footer">
                                    <div class="wizard-footer-left">
                                        ${footerLeft}
                                        <span class="wizard-error" id="w-error"></span>
                                    </div>
                                    ${footerRight}
                                </div>
                            </div>
                        </div>`;

                    // Focus name input on step 1
                    if (wz.step === 1) setTimeout(() => document.getElementById('w-name')?.focus(), 50);
                }

                function attrTagsHtml(list, cls, key) {
                    return list.map((p, i) => {
                        const icon = wz.icons[p] || 'notes.png';
                        const locked = p === 'Serial Number';
                        return `<div class="attr-tag ${cls}" ${locked ? 'title="Required for all card types"' : ''}>
                            <img class="attr-tag-icon" src="/Images/icons/${icon}"
                                onclick="openIconPickerForEdit('${key}',${i},this)" title="Change icon" />
                            ${p}
                            ${locked
                                ? '<span class="attr-tag-pin" title="Required for all card types">&#9632;</span>'
                                : `<span class="attr-tag-remove" onclick="removeAttr('${key}',${i})">×</span>`}
                        </div>`;
                    }).join('');
                }

                function attrPickerHtml(reqKey, optKey) {
                    return `<div class="attr-columns">
                        <div class="attr-col">
                            <div class="attr-col-header req">Required</div>
                            <div class="attr-tags" id="${reqKey}-tags">${attrTagsHtml(wz[reqKey], 'req', reqKey)}</div>
                            <div class="attr-add-wrap">
                                <button class="attr-add-trigger" onclick="openAttrDropdown('${reqKey}', this)">+ Add attribute</button>
                            </div>
                        </div>
                        <div class="attr-col">
                            <div class="attr-col-header opt">Optional</div>
                            <div class="attr-tags" id="${optKey}-tags">${attrTagsHtml(wz[optKey], 'opt', optKey)}</div>
                            <div class="attr-add-wrap">
                                <button class="attr-add-trigger" onclick="openAttrDropdown('${optKey}', this)">+ Add attribute</button>
                            </div>
                        </div>
                    </div>`;
                }

                function removeAttr(key, idx) {
                    if (wz[key][idx] === 'Serial Number') return;
                    wz[key].splice(idx, 1);
                    const cls = key.includes('Required') ? 'req' : 'opt';
                    document.getElementById(key + '-tags').innerHTML = attrTagsHtml(wz[key], cls, key);
                }

                // ── Floating attribute dropdown ─────────────────────────────
                let _dropKey = null;
                let _lastAttrBtn = null; // button that triggered the dropdown (used for icon picker positioning)

                function _getOrCreatePanel() {
                    let p = document.getElementById('_attr-panel');
                    if (p) return p;
                    p = document.createElement('div');
                    p.id = '_attr-panel';
                    p.className = 'attr-dropdown-panel';
                    p.innerHTML = `
                        <input class="attr-dropdown-search" id="_attr-search" placeholder="Search attributes…"
                            oninput="_filterAttrList(this.value)"
                            onkeydown="if(event.key==='Escape'){closeAttrDropdown()}
                                       else if(event.key==='Enter'){const f=document.querySelector('.attr-dropdown-item');if(f)f.click()}" />
                        <div class="attr-dropdown-list" id="_attr-list"></div>`;
                    document.body.appendChild(p);
                    document.addEventListener('click', e => {
                        if (!p.contains(e.target) && !e.target.closest('.attr-add-trigger'))
                            closeAttrDropdown();
                    });
                    return p;
                }

                function openAttrDropdown(key, btn) {
                    _dropKey = key;
                    _lastAttrBtn = btn;
                    const panel = _getOrCreatePanel();
                    const rect  = btn.getBoundingClientRect();

                    panel.style.display = 'flex';
                    panel.style.width   = Math.max(rect.width, 260) + 'px';
                    panel.style.top     = (rect.bottom + 4) + 'px';
                    panel.style.left    = rect.left + 'px';

                    const search = document.getElementById('_attr-search');
                    search.value = '';
                    _filterAttrList('');
                    setTimeout(() => search.focus(), 0);
                }

                function closeAttrDropdown() {
                    const p = document.getElementById('_attr-panel');
                    if (p) p.style.display = 'none';
                    _dropKey = null;
                }

                function _filterAttrList(query) {
                    if (!_dropKey) return;
                    // Exclude props already present in any of the four sections
                    const already = [
                        ...wz.fixedRequired, ...wz.fixedOptional,
                        ...wz.extendedRequired, ...wz.extendedOptional
                    ].map(s => s.toLowerCase());
                    const q = query.trim().toLowerCase();

                    const matches = existingProps.filter(p =>
                        !already.includes(p.toLowerCase()) &&
                        (q === '' || p.toLowerCase().includes(q))
                    );

                    let html = matches.map(p =>
                        `<div class="attr-dropdown-item" onclick="_selectAttr('${p}')">${p}</div>`
                    ).join('');

                    if (q && !existingProps.some(p => p.toLowerCase() === q)) {
                        // Capitalize first letter of each word, keep spaces — backend will convert to C# identifier via SanitizePropertyName
                        const disp = q.trim().split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                        html += `<div class="attr-dropdown-item new-attr" onclick="_selectAttr('${disp}')">+ New attribute: <strong>${disp}</strong></div>`;
                    }

                    document.getElementById('_attr-list').innerHTML =
                        html || `<div class="attr-dropdown-empty">No attributes found</div>`;
                }

                function _selectAttr(val) {
                    if (!_dropKey) return;
                    const key = _dropKey;
                    const already = [
                        ...wz.fixedRequired, ...wz.fixedOptional,
                        ...wz.extendedRequired, ...wz.extendedOptional
                    ].map(s => s.toLowerCase());

                    if (already.includes(val.toLowerCase())) {
                        document.getElementById('w-error').textContent = `"${val}" is already added.`;
                        closeAttrDropdown();
                        return;
                    }
                    document.getElementById('w-error').textContent = '';
                    closeAttrDropdown();
                    // Open icon picker before finalizing the attribute
                    openIconPickerForNew(key, val);
                }
                // ── End dropdown ────────────────────────────────────────────

                // ── Icon picker ────────────────────────────────────────────
                let availableIcons = [];
                let _iconPickerForKey  = null; // wz key when adding a new attr
                let _iconPickerForName = null; // attr name being assigned icon
                let _iconPickerForEdit = null; // { key, idx } when editing existing attr icon

                async function _ensureIcons() {
                    if (availableIcons.length === 0) {
                        const r = await fetch('/api/icons');
                        availableIcons = await r.json();
                    }
                }

                function _getOrCreateIconPanel() {
                    let p = document.getElementById('_icon-panel');
                    if (p) return p;
                    p = document.createElement('div');
                    p.id = '_icon-panel';
                    p.className = 'icon-picker-panel';
                    p.innerHTML = `
                        <div class="icon-picker-header">
                            <input class="icon-picker-search" id="_icon-search" placeholder="Search icons…"
                                oninput="_filterIconGrid(this.value)" />
                            <label class="icon-upload-label">
                                &#8593; Upload
                                <input type="file" accept=".png" style="display:none"
                                    onchange="_uploadAndSelectIcon(this)" />
                            </label>
                        </div>
                        <div class="icon-grid" id="_icon-grid"></div>
                        <div class="icon-picker-footer">
                            <button class="icon-skip-btn" onclick="closeIconPicker(true)">Skip (use default)</button>
                        </div>`;
                    document.body.appendChild(p);
                    document.addEventListener('click', e => {
                        if (!p.contains(e.target) && !e.target.closest('.attr-tag-icon') && !e.target.closest('.attr-add-trigger'))
                            closeIconPicker(true);
                    });
                    return p;
                }

                function _positionIconPanel(panel) {
                    const ref = _lastAttrBtn;
                    if (ref) {
                        const rect = ref.getBoundingClientRect();
                        panel.style.left = rect.left + 'px';
                        panel.style.top  = (rect.bottom + 6) + 'px';
                    } else {
                        panel.style.left = '50%';
                        panel.style.top  = '50%';
                        panel.style.transform = 'translate(-50%,-50%)';
                    }
                }

                async function openIconPickerForNew(key, attrName) {
                    _iconPickerForKey  = key;
                    _iconPickerForName = attrName;
                    _iconPickerForEdit = null;
                    // Pre-populate icon from existing card types if not already set
                    if (!wz.icons[attrName] && existingPropIcons[attrName])
                        wz.icons[attrName] = existingPropIcons[attrName];
                    await _ensureIcons();
                    const panel = _getOrCreateIconPanel();
                    _positionIconPanel(panel);
                    panel.style.display = 'flex';
                    document.getElementById('_icon-search').value = '';
                    _filterIconGrid('');
                    setTimeout(() => document.getElementById('_icon-search').focus(), 0);
                }

                async function openIconPickerForEdit(key, idx, imgEl) {
                    _iconPickerForKey  = key;
                    _iconPickerForName = null;
                    _iconPickerForEdit = { key, idx };
                    _lastAttrBtn = imgEl;
                    await _ensureIcons();
                    const panel = _getOrCreateIconPanel();
                    _positionIconPanel(panel);
                    panel.style.display = 'flex';
                    document.getElementById('_icon-search').value = '';
                    _filterIconGrid('');
                    setTimeout(() => document.getElementById('_icon-search').focus(), 0);
                }

                function _filterIconGrid(query) {
                    const q = query.trim().toLowerCase();
                    const filtered = availableIcons.filter(ic =>
                        q === '' || ic.name.toLowerCase().includes(q)
                    );
                    const currentIcon = _iconPickerForEdit
                        ? (wz.icons[wz[_iconPickerForEdit.key][_iconPickerForEdit.idx]] || 'notes.png')
                        : (wz.icons[_iconPickerForName] || 'notes.png');

                    document.getElementById('_icon-grid').innerHTML = filtered.map(ic =>
                        `<div class="icon-item ${ic.name === currentIcon ? 'selected' : ''}"
                            onclick="_confirmIcon('${ic.name}')"
                            oncontextmenu="_showIconCtxMenu(event,'${ic.name}')"
                            title="${ic.name}">
                            <img src="${ic.url}" alt="${ic.name}" />
                            <div class="icon-item-name">${ic.name.replace('.png','')}</div>
                        </div>`
                    ).join('') || `<div style="grid-column:1/-1;text-align:center;color:#aab8cc;padding:16px;font-size:0.82rem">No icons found</div>`;
                }

                function _confirmIcon(iconFile) {
                    // Save state before closeIconPicker nulls it
                    const pickerEdit = _iconPickerForEdit;
                    const pickerKey  = _iconPickerForKey;
                    const pickerName = _iconPickerForName;
                    closeIconPicker(false);
                    if (pickerEdit) {
                        const propName = wz[pickerEdit.key][pickerEdit.idx];
                        wz.icons[propName] = iconFile;
                        const cls = pickerEdit.key.includes('Required') ? 'req' : 'opt';
                        const el = document.getElementById(pickerEdit.key + '-tags');
                        if (el) el.innerHTML = attrTagsHtml(wz[pickerEdit.key], cls, pickerEdit.key);
                    } else if (pickerKey && pickerName) {
                        wz.icons[pickerName] = iconFile;
                        wz[pickerKey].push(pickerName);
                        const cls = pickerKey.includes('Required') ? 'req' : 'opt';
                        const el = document.getElementById(pickerKey + '-tags');
                        if (el) el.innerHTML = attrTagsHtml(wz[pickerKey], cls, pickerKey);
                    }
                }

                function closeIconPicker(useDefault) {
                    const p = document.getElementById('_icon-panel');
                    if (p) p.style.display = 'none';
                    if (useDefault && _iconPickerForKey && _iconPickerForName) {
                        // User skipped — add attribute with default icon
                        if (!wz.icons[_iconPickerForName]) wz.icons[_iconPickerForName] = 'notes.png';
                        wz[_iconPickerForKey].push(_iconPickerForName);
                        const cls = _iconPickerForKey.includes('Required') ? 'req' : 'opt';
                        const el = document.getElementById(_iconPickerForKey + '-tags');
                        if (el) el.innerHTML = attrTagsHtml(wz[_iconPickerForKey], cls, _iconPickerForKey);
                    }
                    _iconPickerForKey = _iconPickerForName = _iconPickerForEdit = null;
                }

                async function _uploadAndSelectIcon(input) {
                    if (!input.files || !input.files[0]) return;
                    const file = input.files[0];
                    const fd = new FormData();
                    fd.append('file', file);
                    const res = await fetch('/api/upload-icon', { method: 'POST', body: fd });
                    const data = await res.json();
                    if (data.success) {
                        availableIcons.push({ name: data.name, url: data.url });
                        availableIcons.sort((a, b) => a.name.localeCompare(b.name));
                        _filterIconGrid(document.getElementById('_icon-search').value);
                    } else {
                        alert('Upload failed: ' + data.message);
                    }
                    input.value = '';
                }
                let _ctxIconName = null;

                function _getOrCreateIconCtxMenu() {
                    let m = document.getElementById('_icon-ctx-menu');
                    if (m) return m;
                    m = document.createElement('div');
                    m.id = '_icon-ctx-menu';
                    m.className = 'icon-ctx-menu';
                    m.innerHTML = `<div class="icon-ctx-item danger" onclick="_deleteCtxIcon()">&#128465; Delete icon</div>`;
                    document.body.appendChild(m);
                    document.addEventListener('click', e => {
                        if (!e.target.closest('#_icon-ctx-menu')) _closeIconCtxMenu();
                    });
                    return m;
                }

                function _showIconCtxMenu(event, iconName) {
                    event.preventDefault();
                    event.stopPropagation();
                    _ctxIconName = iconName;
                    const m = _getOrCreateIconCtxMenu();
                    const x = Math.min(event.clientX, window.innerWidth - 160);
                    const y = Math.min(event.clientY, window.innerHeight - 50);
                    m.style.left = x + 'px';
                    m.style.top  = y + 'px';
                    m.style.display = 'block';
                }

                function _closeIconCtxMenu() {
                    const m = document.getElementById('_icon-ctx-menu');
                    if (m) m.style.display = 'none';
                    _ctxIconName = null;
                }

                async function _deleteCtxIcon() {
                    if (!_ctxIconName) return;
                    const name = _ctxIconName;
                    _closeIconCtxMenu();
                    if (!confirm('Delete icon "' + name + '"?\n\nThis will permanently remove the file. Card types using this icon will fall back to the default.')) return;
                    const res = await fetch('/api/icon/' + encodeURIComponent(name), { method: 'DELETE' });
                    const data = await res.json();
                    if (data.success) {
                        availableIcons = availableIcons.filter(ic => ic.name !== name);
                        _filterIconGrid(document.getElementById('_icon-search')?.value || '');
                    } else {
                        alert('Delete failed: ' + (data.message || 'Unknown error'));
                    }
                }
                // ── End icon picker ─────────────────────────────────────────

                async function deleteCard(name) {
                    if (!confirm(`Delete "${name}" card type?\n\nThe model and template files will be permanently removed. CSV data files are kept.`)) return;

                    document.getElementById('content').innerHTML = `
                        <div class="wizard">
                            <div class="wizard-card">
                                <div class="wizard-success-box">
                                    <div class="success-icon">⚙️</div>
                                    <h3>Building...</h3>
                                    <p>Removing "${name}" card type and rebuilding.</p>
                                    <div id="restart-status" style="margin-top:14px;color:#7a92b5;font-size:0.83rem;">Waiting for restart&hellip;</div>
                                </div>
                            </div>
                        </div>`;

                    const res = await fetch('/api/card-type/' + encodeURIComponent(name), { method: 'DELETE' });
                    const data = await res.json();

                    if (!data.success) {
                        document.getElementById('content').innerHTML = `
                            <div class="placeholder"><div class="placeholder-arrow">⚠️</div><div>${data.message}</div></div>`;
                        return;
                    }

                    if (data.restarting) waitForRestart();
                }

                function wizardNext() {
                    document.getElementById('w-error').textContent = '';
                    if (wz.step === 1) {
                        const n = wz.name.trim();
                        if (!n) { document.getElementById('w-error').textContent = 'Name is required.'; return; }
                        if (!/^[A-Z][a-zA-Z]*(\s+[A-Za-z]+)*$/.test(n)) {
                            document.getElementById('w-error').textContent = 'Name must start with a capital letter and contain only letters (spaces allowed).';
                            return;
                        }
                    }
                    if (wz.step === 3 && wz.fixedRequired.length === 0 && wz.fixedOptional.length === 0) {
                        document.getElementById('w-error').textContent = 'Add at least one attribute.'; return;
                    }
                    // Group step validation (last step before create): if "new group" selected, name is required
                    const totalSteps = wz.isExtendable ? 5 : 4;
                    if (wz.step === totalSteps - 1) {
                        // We're about to go to the group step — nothing to validate here
                    }
                    wz.step++;
                    renderWizard();
                }

                function wizardBack() {
                    wz.step--;
                    renderWizard();
                }

                async function wizardCreate() {
                    if (wz.fixedRequired.length === 0 && wz.fixedOptional.length === 0) {
                        document.getElementById('w-error').textContent = 'Add at least one attribute.'; return;
                    }
                    // Validate group step: if "create new group" is selected, name must be filled
                    if (wz.group === '__new__' && !wz.newGroupName.trim()) {
                        document.getElementById('w-error').textContent = 'Enter a name for the new group.'; return;
                    }
                    const resolvedGroup = wz.group === '__new__'
                        ? wz.newGroupName.trim()
                        : (wz.group || null);

                    const btn = document.querySelector('.wbtn-success');
                    btn.disabled = true;
                    btn.textContent = wz.isModify ? 'Saving…' : 'Creating…';

                    const url    = wz.isModify ? '/api/card-type/' + encodeURIComponent(wz.originalName) : '/api/create-card-type';
                    const method = wz.isModify ? 'PUT' : 'POST';
                    const payload = wz.isModify
                        ? { newName: wz.name, isExtendable: wz.isExtendable,
                            fixedRequired: wz.fixedRequired, fixedOptional: wz.fixedOptional,
                            extendedRequired: wz.extendedRequired, extendedOptional: wz.extendedOptional,
                            icons: wz.icons, groupName: resolvedGroup }
                        : { name: wz.name, isExtendable: wz.isExtendable,
                            fixedRequired: wz.fixedRequired, fixedOptional: wz.fixedOptional,
                            extendedRequired: wz.extendedRequired, extendedOptional: wz.extendedOptional,
                            icons: wz.icons, groupName: resolvedGroup };

                    const res = await fetch(url, {
                        method,
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload),
                    });
                    const data = await res.json();

                    if (data.success && data.restarting) {
                        const actionLabel = wz.isModify ? 'Saving changes' : 'Creating';
                        document.querySelector('.wizard-card').innerHTML = `
                            <div class="wizard-success-box">
                                <div class="success-icon">&#9881;&#65039;</div>
                                <h3>Building...</h3>
                                <p>${actionLabel} and rebuilding. The dashboard will update automatically.</p>
                                <div id="restart-status" style="margin-top:14px;color:#7a92b5;font-size:0.83rem;">Waiting for restart&hellip;</div>
                            </div>`;
                        waitForRestart();
                    } else if (data.success) {
                        document.querySelector('.wizard-card').innerHTML = `
                            <div class="wizard-success-box">
                                <div class="success-icon">&#9989;</div>
                                <h3>${wz.isModify ? 'Card type updated!' : 'Card type created!'}</h3>
                                <p>${data.message}</p>
                            </div>`;
                    } else {
                        btn.disabled = false;
                        btn.textContent = wz.isModify ? 'Save changes' : 'Create card type';
                        document.getElementById('w-error').textContent = data.message;
                    }
                }
                async function doRestart() {
                    const btn = document.getElementById('btn-restart');
                    const overlay = document.getElementById('restart-overlay');
                    const status = document.getElementById('restart-overlay-status');
                    const sleep = ms => new Promise(r => setTimeout(r, ms));

                    btn.disabled = true;
                    overlay.classList.add('open');
                    status.textContent = 'Sending restart request…';

                    try { await fetch('/api/restart', { method: 'POST' }); }
                    catch { /* server may close the connection immediately — that's fine */ }

                    status.textContent = 'Waiting for server to go down…';
                    await sleep(800);
                    let isDown = false;
                    for (let i = 0; i < 40 && !isDown; i++) {
                        try { await fetch('/health', { cache: 'no-store' }); await sleep(300); }
                        catch { isDown = true; }
                    }

                    if (!isDown) {
                        status.textContent = 'Timed out. Restart manually: dotnet run -- --dashboard';
                        btn.disabled = false;
                        return;
                    }

                    status.textContent = 'Starting new server (4 sec)…';
                    for (let i = 0; i < 60; i++) {
                        await sleep(1000);
                        try {
                            const r = await fetch('/health', { cache: 'no-store' });
                            if (r.ok) { status.textContent = 'Done! Reloading…'; await sleep(800); window.location.reload(); return; }
                        } catch { /* not up yet */ }
                    }
                    status.textContent = 'Timed out. Restart manually: dotnet run -- --dashboard';
                    btn.disabled = false;
                }

                async function waitForRestart() {
                    const status = document.getElementById('restart-status');
                    const sleep = ms => new Promise(r => setTimeout(r, ms));

                    // Phase 1: wait for the old server to go down (connection refused)
                    await sleep(800);
                    let isDown = false;
                    for (let i = 0; i < 40 && !isDown; i++) {
                        try {
                            await fetch('/health', { cache: 'no-store' });
                            await sleep(300); // still up, keep waiting
                        } catch {
                            isDown = true; // connection refused = server stopped
                        }
                    }

                    if (!isDown) {
                        if (status) status.textContent = 'Timed out. Restart manually: dotnet run -- --dashboard';
                        return;
                    }

                    // Phase 2: wait for the new server to come up
                    if (status) status.textContent = 'Restarting new server (4 sec) …';
                    for (let i = 0; i < 60; i++) {
                        await sleep(1000);
                        try {
                            const r = await fetch('/health', { cache: 'no-store' });
                            if (r.ok) {
                                if (status) status.textContent = 'Restart successful! Reloading…';
                                await sleep(800);
                                window.location.reload();
                                return;
                            }
                        } catch { /* not up yet */ }
                    }
                    if (status) status.textContent = 'Timed out. Restart manually: dotnet run -- --dashboard';
                }

                // ── End Wizard ───────────────────────────────────────────────

                // ── Generate Cards ────────────────────────────────────────────
                let _genPollTimer = null;

                function openGenModal() {
                    document.getElementById('gen-overlay').classList.add('open');
                    document.getElementById('gen-modal').classList.add('open');
                    document.getElementById('gen-preview-view').style.display = '';
                    document.getElementById('gen-progress-view').style.display = 'none';
                    document.getElementById('gen-complete-view').style.display = 'none';
                    document.getElementById('gen-existing').textContent = '—';
                    document.getElementById('gen-new').textContent = '—';
                    document.getElementById('gen-updated').textContent = '—';
                    document.getElementById('gen-header-sub').textContent = 'Analyzing your CSV data…';
                    document.getElementById('gen-confirm-btn').disabled = true;
                    _fetchGenPreview();
                }

                function closeGenModal() {
                    if (_genPollTimer) { clearInterval(_genPollTimer); _genPollTimer = null; }
                    document.getElementById('gen-overlay').classList.remove('open');
                    document.getElementById('gen-modal').classList.remove('open');
                }

                async function _fetchGenPreview() {
                    try {
                        const res = await fetch('/api/generate/preview');
                        const p = await res.json();
                        if (p.configError) {
                            document.getElementById('gen-header-sub').textContent = 'Configuration error: ' + p.configError;
                            return;
                        }
                        document.getElementById('gen-existing').textContent = p.existingCount;
                        document.getElementById('gen-new').textContent = p.newCount;
                        document.getElementById('gen-updated').textContent = p.updatedCount;
                        const toGen = p.newCount + p.updatedCount;
                        document.getElementById('gen-header-sub').textContent = toGen === 0
                            ? 'All cards are already up to date.'
                            : `${toGen} card${toGen !== 1 ? 's' : ''} will be generated.`;
                        document.getElementById('gen-confirm-btn').disabled = toGen === 0;
                        const warnEl = document.getElementById('gen-warning');
                        if (p.unknownCsvFiles && p.unknownCsvFiles.length > 0) {
                            document.getElementById('gen-warning-list').innerHTML =
                                p.unknownCsvFiles.map(f => `<li>${f}</li>`).join('');
                            warnEl.style.display = '';
                        } else {
                            warnEl.style.display = 'none';
                        }
                    } catch {
                        document.getElementById('gen-header-sub').textContent = 'Failed to load preview.';
                    }
                }

                async function startGeneration() {
                    document.getElementById('gen-preview-view').style.display = 'none';
                    document.getElementById('gen-progress-view').style.display = '';
                    document.getElementById('gen-bar').style.width = '0%';
                    document.getElementById('gen-progress-label').textContent = 'Starting…';
                    document.getElementById('gen-progress-card').textContent = ' ';

                    try {
                        const res = await fetch('/api/generate/start', { method: 'POST' });
                        if (!res.ok) {
                            document.getElementById('gen-progress-view').style.display = 'none';
                            document.getElementById('gen-preview-view').style.display = '';
                            document.getElementById('gen-header-sub').textContent = 'Generation already in progress.';
                            return;
                        }
                    } catch {
                        return;
                    }

                    _genPollTimer = setInterval(async () => {
                        try {
                            const prog = await fetch('/api/generate/progress').then(r => r.json());
                            const pct = prog.total > 0 ? Math.round(prog.done / prog.total * 100) : 0;
                            document.getElementById('gen-bar').style.width = pct + '%';
                            document.getElementById('gen-progress-label').textContent =
                                `${prog.done} / ${prog.total}  (${pct}%)`;
                            document.getElementById('gen-progress-sub').textContent =
                                `${prog.generated} generated, ${prog.skipped} skipped`;
                            if (prog.currentCard)
                                document.getElementById('gen-progress-card').textContent = prog.currentCard;

                            if (prog.isCompleted) {
                                clearInterval(_genPollTimer);
                                _genPollTimer = null;
                                document.getElementById('gen-progress-view').style.display = 'none';
                                document.getElementById('gen-complete-view').style.display = '';
                                document.getElementById('gen-done-count').textContent = prog.generated;
                                document.getElementById('gen-skip-count').textContent = prog.skipped;
                                if (prog.error) {
                                    document.getElementById('gen-complete-title').textContent = 'Generation Failed';
                                    const errEl = document.getElementById('gen-error-msg');
                                    errEl.textContent = prog.error;
                                    errEl.style.display = '';
                                }
                            }
                        } catch { /* server busy, ignore */ }
                    }, 600);
                }
                // ── End Generate Cards ────────────────────────────────────────

                // ── Browse Cards ──────────────────────────────────────────────
                function browseThumbError(img) {
                    img.parentElement.innerHTML = '<span class="browse-thumb-placeholder">No image</span>';
                }
                let browseData = [];             // OutputCardTypeInfo[]
                let browseActiveType = 'all';   // folder name or 'all'
                let browseFlat = [];             // flat list of visible cards for lightbox nav
                let browseSearchMode = 'serial'; // 'serial' | 'name'

                // Hover preview
                let _hoverTimer = null;
                const _hoverPreview = document.getElementById('card-hover-preview');
                const _hoverImg    = document.getElementById('card-hover-img');

                function showCardPreview(src, rect) {
                    _hoverImg.src = src;
                    const previewW = 356; // 340px img + 2*8px padding
                    const margin = 14;
                    let left = rect.right + margin;
                    if (left + previewW > window.innerWidth - 8)
                        left = rect.left - previewW - margin;
                    left = Math.max(8, left);
                    let top = rect.top;
                    // approx height based on card aspect ratio (cards are portrait ~500px tall at 340px wide)
                    const approxH = Math.round(previewW * 1.45);
                    if (top + approxH > window.innerHeight - 8)
                        top = window.innerHeight - approxH - 8;
                    top = Math.max(8, top);
                    _hoverPreview.style.left = left + 'px';
                    _hoverPreview.style.top  = top  + 'px';
                    _hoverPreview.style.display = 'block';
                    // force reflow so the transition fires
                    void _hoverPreview.offsetWidth;
                    _hoverPreview.classList.add('visible');
                }

                function hideCardPreview() {
                    clearTimeout(_hoverTimer);
                    _hoverTimer = null;
                    _hoverPreview.classList.remove('visible');
                    // hide after fade-out
                    setTimeout(() => { if (!_hoverPreview.classList.contains('visible')) _hoverPreview.style.display = 'none'; }, 130);
                }
                let lbIndex = -1;             // current lightbox position in active flat list
                let lbShowingExtended = false;
                let lbMode = 'browse';        // 'browse' | 'icon'
                let iconLbFlat = [];          // flat list of visible icons for lightbox nav

                async function showBrowse() {
                    _setNavActive('btn-browse');
                    selectedIndex = -1;
                    renderBrowseSidebar();

                    document.getElementById('content').innerHTML =
                        `<div class="browse-toolbar">
                            <div class="browse-mode-toggle">
                                <button class="browse-mode-btn active" id="browse-mode-serial" onclick="setBrowseMode('serial')">Serial Number</button>
                                <button class="browse-mode-btn" id="browse-mode-name" onclick="setBrowseMode('name')">Name</button>
                            </div>
                            <input class="browse-search" id="browse-search" type="search"
                                   placeholder="Search by serial number…" oninput="filterBrowse()" autocomplete="off" />
                            <span class="browse-count-label" id="browse-count"></span>
                         </div>
                         <div class="browse-grid" id="browse-grid">
                            <div class="browse-empty">Loading…</div>
                         </div>`;

                    if (browseData.length === 0) {
                        await loadBrowseData();
                        renderBrowseSidebar(); // re-render with actual counts
                    }
                    renderBrowseGrid();
                }

                async function loadBrowseData() {
                    try {
                        const r = await fetch('/api/output-cards');
                        browseData = await r.json();
                    } catch { browseData = []; }
                }

                function renderBrowseSidebar() {
                    // Use totalPngCount (includes extended versions) so the count matches Generate.
                    const total = browseData.reduce((s, t) => s + (t.totalPngCount ?? t.cards.length), 0);

                    // Normalize a string to lowercase without separators for fuzzy matching
                    // e.g. "research_institute" and "ResearchInstitute" both → "researchinstitute"
                    const normStr = s => s.toLowerCase().replace(/[_\-\s]/g, '');

                    // Find the PascalCase card name (from `cards`) that corresponds to a browse folder type
                    // Handles plural/singular mismatches: "countries" ↔ "Country", "cities" ↔ "City"
                    function cardNameForBrowseType(browseType) {
                        const nb = normStr(browseType);
                        const stemB = nb.length > 1 ? nb.slice(0, -1) : nb;
                        const match = cards.find(c => {
                            const nc = normStr(c.name);
                            const stemC = nc.length > 1 ? nc.slice(0, -1) : nc;
                            return nc === nb || nb.startsWith(stemC) || nc.startsWith(stemB);
                        });
                        return match ? match.name : null;
                    }

                    function typeItem(t) {
                        return `<div class="browse-type-item ${browseActiveType === t.type ? 'active' : ''}"
                                      onclick="setBrowseType('${t.type}')">
                                    <span class="browse-type-name">${t.type}</span>
                                    <span class="browse-type-count">${t.totalPngCount ?? t.cards.length}</span>
                                </div>`;
                    }

                    let html = `<div class="sidebar-label">Browse by type</div>
                                <div class="browse-type-item ${browseActiveType === 'all' ? 'active' : ''}"
                                     onclick="setBrowseType('all')">
                                    <span class="browse-type-name">All types</span>
                                    <span class="browse-type-count">${total}</span>
                                </div>`;

                    if (groups.length === 0) {
                        // No groups defined — flat list
                        html += browseData.map(t => typeItem(t)).join('');
                    } else {
                        // Build set of card names that belong to any group
                        const groupedCardNames = new Set(groups.flatMap(g => g.types));

                        for (const group of groups) {
                            // Find browse types whose resolved card name is in this group
                            const groupItems = browseData.filter(t => {
                                const cn = cardNameForBrowseType(t.type);
                                return cn && group.types.includes(cn);
                            });
                            if (groupItems.length === 0) continue; // group has no generated cards yet

                            const isOpen = !collapsedGroups.has(group.name);
                            const gname = _escHtml(group.name);
                            const groupCount = groupItems.reduce((s, t) => s + (t.totalPngCount ?? t.cards.length), 0);

                            html += `<div class="group-section">
                                <div class="group-header" onclick="toggleGroup('${gname}')">
                                    <span class="group-chevron ${isOpen ? 'open' : ''}">&#9654;</span>
                                    <span class="group-name">${gname}</span>
                                    <span class="group-count">${groupCount}</span>
                                </div>`;
                            if (isOpen) {
                                html += `<div class="group-items">`;
                                for (const t of groupItems) {
                                    html += `<div class="browse-type-item ${browseActiveType === t.type ? 'active' : ''}"
                                                  style="padding-left:28px"
                                                  onclick="setBrowseType('${t.type}')">
                                                 <span class="browse-type-name">${t.type}</span>
                                                 <span class="browse-type-count">${t.totalPngCount ?? t.cards.length}</span>
                                             </div>`;
                                }
                                html += `</div>`;
                            }
                            html += `</div>`;
                        }

                        // Ungrouped: browse types whose card name is not in any group
                        const ungrouped = browseData.filter(t => {
                            const cn = cardNameForBrowseType(t.type);
                            return !cn || !groupedCardNames.has(cn);
                        });
                        if (ungrouped.length > 0) {
                            html += `<div class="ungrouped-label">Ungrouped</div>`;
                            html += ungrouped.map(t => typeItem(t)).join('');
                        }
                    }

                    document.getElementById('card-list').innerHTML = html;
                }

                function setBrowseType(type) {
                    browseActiveType = type;
                    renderBrowseSidebar();
                    const el = document.getElementById('browse-search');
                    if (el) el.value = '';
                    renderBrowseGrid();
                }

                function filterBrowse() { renderBrowseGrid(); }

                function setBrowseMode(mode) {
                    browseSearchMode = mode;
                    const serial = document.getElementById('browse-mode-serial');
                    const name   = document.getElementById('browse-mode-name');
                    const input  = document.getElementById('browse-search');
                    if (serial) serial.classList.toggle('active', mode === 'serial');
                    if (name)   name.classList.toggle('active', mode === 'name');
                    if (input)  { input.value = ''; input.placeholder = mode === 'serial' ? 'Search by serial number…' : 'Search by name…'; }
                    renderBrowseGrid();
                }

                function renderBrowseGrid() {
                    const grid = document.getElementById('browse-grid');
                    const countLabel = document.getElementById('browse-count');
                    if (!grid) return;

                    const query = (document.getElementById('browse-search')?.value || '').trim().toLowerCase();

                    // Build flat list of all matching cards
                    const visible = [];
                    for (const type of browseData) {
                        if (browseActiveType !== 'all' && type.type !== browseActiveType) continue;
                        for (const card of type.cards) {
                            if (query) {
                                if (browseSearchMode === 'name') {
                                    if (!(card.name || '').toLowerCase().includes(query)) continue;
                                } else {
                                    if (!card.serialDisplay.toLowerCase().includes(query)
                                     && !card.code.toLowerCase().includes(query)) continue;
                                }
                            }
                            visible.push({ ...card, typeName: type.type, isExtendable: type.isExtendable });
                        }
                    }

                    browseFlat = visible;

                    if (countLabel)
                        countLabel.textContent = visible.length === 0 ? 'No cards'
                            : `${visible.length} card${visible.length !== 1 ? 's' : ''}`;

                    if (visible.length === 0) {
                        grid.innerHTML = `<div class="browse-empty">No cards match your search.</div>`;
                        return;
                    }

                    grid.innerHTML = visible.map((card, idx) =>
                        `<div class="browse-card" onclick="openLightbox(${idx})" data-preview="${card.path}">
                            <div class="browse-thumb">
                                <img src="${card.path}" alt="${card.serialDisplay}" loading="lazy"
                                     onerror="browseThumbError(this)" />
                            </div>
                            <div class="browse-meta">
                                <span class="browse-serial">${card.serialDisplay}</span>
                                ${card.name ? `<span class="browse-name">${card.name}</span>` : ''}
                                <span class="browse-type-tag">${card.typeName}</span>
                            </div>
                         </div>`
                    ).join('');

                    // Attach hover preview listeners (750ms delay to avoid accidental triggers)
                    grid.querySelectorAll('.browse-card').forEach(card => {
                        card.addEventListener('mouseenter', () => {
                            const src = card.dataset.preview;
                            if (!src) return;
                            clearTimeout(_hoverTimer);
                            _hoverTimer = setTimeout(() => showCardPreview(src, card.getBoundingClientRect()), 750);
                        });
                        card.addEventListener('mouseleave', hideCardPreview);
                    });
                }

                // ── Lightbox ─────────────────────────────────────────────────
                function _lbFlat()  { return lbMode === 'icon' ? iconLbFlat : browseFlat; }

                function openLightbox(idx) {
                    lbMode = 'browse';
                    lbIndex = idx;
                    lbShowingExtended = false;
                    lbRender();
                    document.getElementById('lb-overlay').classList.add('open');
                    document.getElementById('lb-modal').classList.add('open');
                    document.addEventListener('keydown', lbKeyHandler);
                }

                function openIconInLightbox(idx) {
                    lbMode = 'icon';
                    lbIndex = idx;
                    lbShowingExtended = false;
                    lbRender();
                    document.getElementById('lb-overlay').classList.add('open');
                    document.getElementById('lb-modal').classList.add('open');
                    document.addEventListener('keydown', lbKeyHandler);
                }

                function closeLightbox() {
                    document.getElementById('lb-overlay').classList.remove('open');
                    document.getElementById('lb-modal').classList.remove('open');
                    document.removeEventListener('keydown', lbKeyHandler);
                }

                function lbRender() {
                    const flat = _lbFlat();
                    const item = flat[lbIndex];
                    if (!item) return;

                    if (lbMode === 'icon') {
                        document.getElementById('lb-img').src = item.url;
                        document.getElementById('lb-img').alt = item.name;
                        document.getElementById('lb-serial').textContent = item.name;
                        document.getElementById('lb-type').textContent = item.folder;
                        document.getElementById('lb-toggle').style.display = 'none';
                    } else {
                        const src = (lbShowingExtended && item.extendedPath) ? item.extendedPath : item.path;
                        document.getElementById('lb-img').src = src;
                        document.getElementById('lb-img').alt = item.serialDisplay;
                        document.getElementById('lb-serial').textContent = item.serialDisplay;
                        document.getElementById('lb-type').textContent = item.typeName
                            + (item.isExtendable ? (lbShowingExtended ? '  —  extended' : '  —  shortened') : '');

                        const toggleBtn = document.getElementById('lb-toggle');
                        if (item.extendedPath) {
                            toggleBtn.style.display = '';
                            toggleBtn.textContent = lbShowingExtended ? 'Show shortened' : 'Show extended';
                        } else {
                            toggleBtn.style.display = 'none';
                        }
                    }

                    document.getElementById('lb-prev').disabled = lbIndex === 0;
                    document.getElementById('lb-next').disabled = lbIndex === flat.length - 1;
                }

                function lbNav(dir) {
                    const flat = _lbFlat();
                    const next = lbIndex + dir;
                    if (next < 0 || next >= flat.length) return;
                    lbIndex = next;
                    lbShowingExtended = false;
                    lbRender();
                }

                function lbToggleVersion() {
                    lbShowingExtended = !lbShowingExtended;
                    lbRender();
                }

                function lbCopySerial() {
                    const flat = _lbFlat();
                    const item = flat[lbIndex];
                    if (!item) return;
                    const text = lbMode === 'icon' ? item.name : item.serialDisplay;
                    navigator.clipboard.writeText(text).catch(() => {});
                    const btn = document.querySelector('.lb-copy');
                    const orig = btn.textContent;
                    btn.textContent = 'Copied!';
                    setTimeout(() => { btn.textContent = orig; }, 1500);
                }

                function lbKeyHandler(e) {
                    if (e.key === 'Escape') { closeLightbox(); return; }
                    if (e.key === 'ArrowLeft')  { lbNav(-1); return; }
                    if (e.key === 'ArrowRight') { lbNav(1);  return; }
                }
                // ── End Browse Cards ──────────────────────────────────────────

                // ── Icons Manager ─────────────────────────────────────────────
                let iconFolders = [];       // [{ folder, label, icons:[{name,url}] }]
                let iconActiveFolder = '';  // current folder key
                let iconSearch = '';

                function _setNavActive(btnId) {
                    ['btn-overview','btn-browse','btn-icons'].forEach(id => {
                        document.getElementById(id)?.classList.remove('active');
                    });
                    document.getElementById(btnId)?.classList.add('active');
                }

                async function showIcons() {
                    _setNavActive('btn-icons');
                    selectedIndex = -1;
                    renderSidebar();

                    document.getElementById('content').innerHTML =
                        '<div class="placeholder"><div class="placeholder-arrow">&#8635;</div><div>Loading icons…</div></div>';

                    await loadIconFolders();
                    if (iconActiveFolder === '' && iconFolders.length > 0)
                        iconActiveFolder = iconFolders[0].folder;
                    renderIconsView();
                }

                async function loadIconFolders() {
                    try {
                        const r = await fetch('/api/icon-folders');
                        iconFolders = await r.json();
                    } catch { iconFolders = []; }
                }

                function renderIconsView() {
                    const tabs = iconFolders.map(f =>
                        `<button class="icons-tab ${f.folder === iconActiveFolder ? 'active' : ''}"
                                 onclick="switchIconFolder('${f.folder}')">
                            ${f.label} <span style="font-weight:400;color:var(--t3)">(${f.icons.length})</span>
                         </button>`
                    ).join('');

                    document.getElementById('content').innerHTML = `
                        <div class="icons-view">
                            <div class="icons-folder-tabs">${tabs}</div>
                            <div class="icons-toolbar">
                                <input class="icons-search" id="icons-search" type="search"
                                       placeholder="Filter icons…" oninput="filterIcons()" autocomplete="off" />
                                <label class="icons-upload-btn" title="Upload a PNG icon to this folder">
                                    &#8679; Upload PNG
                                    <input type="file" accept=".png" style="display:none"
                                           onchange="uploadIcon(this)" />
                                </label>
                                <span class="icons-count" id="icons-count"></span>
                            </div>
                            <div class="icons-grid" id="icons-grid"></div>
                        </div>`;

                    renderIconGrid();
                }

                function switchIconFolder(folder) {
                    iconActiveFolder = folder;
                    iconSearch = '';
                    renderIconsView();
                }

                function filterIcons() {
                    iconSearch = document.getElementById('icons-search')?.value.trim().toLowerCase() || '';
                    renderIconGrid();
                }

                function renderIconGrid() {
                    const grid = document.getElementById('icons-grid');
                    const countEl = document.getElementById('icons-count');
                    if (!grid) return;

                    const folder = iconFolders.find(f => f.folder === iconActiveFolder);
                    const all = folder?.icons || [];
                    const visible = iconSearch ? all.filter(ic => ic.name.toLowerCase().includes(iconSearch)) : all;

                    // Build flat list for lightbox navigation, attaching folder info
                    iconLbFlat = visible.map(ic => ({ ...ic, folder: iconActiveFolder }));

                    if (countEl) countEl.textContent = `${visible.length} icon${visible.length !== 1 ? 's' : ''}`;

                    if (visible.length === 0) {
                        grid.innerHTML = '<div class="icons-empty">No icons found.</div>';
                        return;
                    }

                    grid.innerHTML = visible.map((ic, idx) => `
                        <div class="icon-mgmt-card" id="ic-${CSS.escape(ic.name)}">
                            <img class="icon-mgmt-img" src="${ic.url}" alt="${ic.name}"
                                 onclick="openIconInLightbox(${idx})" title="Click to enlarge" />
                            <span class="icon-mgmt-name" title="Click to rename"
                                  onclick="startRename('${iconActiveFolder}','${ic.name}',this)">${ic.name}</span>
                            <div class="icon-mgmt-actions">
                                <button class="icon-mgmt-del"
                                        onclick="deleteIcon('${iconActiveFolder}','${ic.name}')">Delete</button>
                            </div>
                        </div>`
                    ).join('');
                }

                async function uploadIcon(input) {
                    const file = input.files[0];
                    if (!file) return;
                    const form = new FormData();
                    form.append('file', file);
                    try {
                        const r = await fetch('/api/icon-folders/' + iconActiveFolder + '/upload', { method: 'POST', body: form });
                        const data = await r.json();
                        if (!data.success) { alert(data.message); return; }
                        // Refresh icon list and sync availableIcons if it's the main icons folder
                        await loadIconFolders();
                        if (iconActiveFolder === 'icons') availableIcons = [];
                        renderIconGrid();
                    } catch { alert('Upload failed.'); }
                    input.value = '';
                }

                async function deleteIcon(folder, name) {
                    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
                    try {
                        const r = await fetch('/api/icon-folders/' + folder + '/' + encodeURIComponent(name), { method: 'DELETE' });
                        const data = await r.json();
                        if (!data.success) { alert(data.message); return; }
                        const f = iconFolders.find(f => f.folder === folder);
                        if (f) f.icons = f.icons.filter(ic => ic.name !== name);
                        if (folder === 'icons') availableIcons = [];
                        renderIconGrid();
                    } catch { alert('Delete failed.'); }
                }

                function startRename(folder, name, el) {
                    if (el.tagName === 'INPUT') return;
                    const input = document.createElement('input');
                    input.className = 'icon-mgmt-name-input';
                    input.value = name.replace(/\.png$/i, '');
                    el.replaceWith(input);
                    input.focus();
                    input.select();

                    const commit = async () => {
                        let newName = input.value.trim();
                        if (!newName || newName + '.png' === name) { cancelRename(input, name); return; }
                        try {
                            const r = await fetch(
                                '/api/icon-folders/' + folder + '/' + encodeURIComponent(name),
                                { method: 'PUT', headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ newName }) }
                            );
                            const data = await r.json();
                            if (!data.success) { alert(data.message); cancelRename(input, name); return; }
                            const f = iconFolders.find(f => f.folder === folder);
                            if (f) {
                                const ic = f.icons.find(ic => ic.name === name);
                                if (ic) { ic.name = data.newName; ic.url = data.url; }
                            }
                            if (folder === 'icons') availableIcons = [];
                            renderIconGrid();
                        } catch { alert('Rename failed.'); cancelRename(input, name); }
                    };

                    input.addEventListener('keydown', e => {
                        if (e.key === 'Enter') { e.preventDefault(); commit(); }
                        if (e.key === 'Escape') cancelRename(input, name);
                    });
                    input.addEventListener('blur', commit);
                }

                function cancelRename(input, originalName) {
                    const span = document.createElement('span');
                    span.className = 'icon-mgmt-name';
                    span.title = 'Click to rename';
                    span.textContent = originalName;
                    span.onclick = () => startRename(iconActiveFolder, originalName, span);
                    input.replaceWith(span);
                }
                // ── End Icons Manager ─────────────────────────────────────────

                init();
            </script>
        </body>
        </html>
        """;
}

public class CardTypeInfo
{
    public string Name { get; set; } = "";
    public string DisplayName { get; set; } = "";
    public bool IsExtendable { get; set; }
    public string? MockupImageShort { get; set; }
    public string? MockupImageExtended { get; set; }
    public string ExpectedCsvFilename { get; set; } = "";
    public List<CardProperty> Properties { get; set; } = new();
}

public class CardProperty
{
    public string Name { get; set; } = "";
    public string DisplayName { get; set; } = "";
    public bool IsOptional { get; set; }
}

public class OutputCardTypeInfo
{
    public string Type { get; set; } = "";
    public bool IsExtendable { get; set; }
    public List<OutputCardInfo> Cards { get; set; } = new();
    // For extendable types, Cards contains one entry per subject (shortened view).
    // TotalPngCount includes both shortened AND extended PNGs so it matches the Generate count.
    public int TotalPngCount { get; set; }
}

public class OutputCardInfo
{
    public string Code { get; set; } = "";
    public string SerialDisplay { get; set; } = "";
    public string? Name { get; set; }
    public string Path { get; set; } = "";
    public string? ExtendedPath { get; set; }
}

public class RenameIconRequest
{
    public string? NewName { get; set; }
}

public class CardGroup
{
    public string Name { get; set; } = "";
    public List<string> Types { get; set; } = new(); // PascalCase card type names (c.name without "CardModel")
}

public class CreateGroupRequest
{
    public string Name { get; set; } = "";
    public List<string>? Types { get; set; }
}

public class UpdateGroupRequest
{
    public string? NewName { get; set; }
    public List<string>? Types { get; set; }
    public string? AddType { get; set; }
    public string? RemoveType { get; set; }
}
