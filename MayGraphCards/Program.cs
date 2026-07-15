using MayGraphCards.Configurations;
using MayGraphCards.Dashboard;
using MayGraphCards.Enumerations;
using MayGraphCards.Exceptions;
using MayGraphCards.Models;
using MayGraphCards.Services;
using Microsoft.Extensions.Configuration;

if (args.Any(a => a.Equals("--dashboard", StringComparison.OrdinalIgnoreCase)
                || a.Equals("dashboard", StringComparison.OrdinalIgnoreCase)))
{
    await DashboardServer.RunAsync(args);
    return;
}

try
{
    Console.WriteLine($"================== MayGraph - Card Generation ==================\n");

    AppSettings config = new ConfigurationBuilder()
        .AddJsonFile("appsettings.json")
        .Build()
        .Get<AppSettings>()
        ?? throw new InvalidOperationException("appsettings.json is missing or malformed.");

    if (String.IsNullOrWhiteSpace(config.InputDirectory))
        throw new InvalidOperationException("'InputDirectory' is not set in appsettings.json.");
    if (String.IsNullOrWhiteSpace(config.OutputDirectory))
        throw new InvalidOperationException("'OutputDirectory' is not set in appsettings.json.");
    if (String.IsNullOrWhiteSpace(config.CsvDelimiter))
        throw new InvalidOperationException("'CsvDelimiter' is not set in appsettings.json.");

    CsvParser csvParser = new CsvParser(config.CsvDelimiter);
    TemplateRenderer templateRenderer = new TemplateRenderer();
    ImageRenderer imageRenderer = new ImageRenderer(config.BrowserPath);
    await imageRenderer.InitialisationAsync();

    String templateDirectory = Path.Combine(AppContext.BaseDirectory, "wwwroot", "Templates");
    String baseHref = new Uri(Path.Combine(AppContext.BaseDirectory, "wwwroot") + Path.DirectorySeparatorChar).AbsoluteUri;
    Int32 totalRecordsCount = 0;

    // Ensure the output folder exists
    String outputDir = Path.Combine(AppContext.BaseDirectory, config.OutputDirectory);
    Directory.CreateDirectory(outputDir);

    GenerationManifest manifest = new GenerationManifest(outputDir);
    Int32 totalSkippedCount = 0;

    List<String> csvFilePaths = Directory.EnumerateFiles(Path.Combine(AppContext.BaseDirectory, config.InputDirectory), "*.csv", SearchOption.AllDirectories).ToList();
    Console.WriteLine($"Input files found: {csvFilePaths.Count}");
    Console.WriteLine("\n - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -\n");

    // Process each CSV file
    foreach (String csvPath in csvFilePaths)
    {
        Console.WriteLine($"> Processing file: {Path.GetFileName(csvPath)}");

        String csvOutputDir = Path.Combine(outputDir, Path.GetFileNameWithoutExtension(csvPath));
        Directory.CreateDirectory(csvOutputDir);
        String? csvOutputVersionDir = null;

        // Read the CSV data
        List<CardModel> records = csvParser.ParseCsv(csvPath);

        if (records.Count != 0)
        {
            Type modelType = records[0].GetType(); // All records are of the same type
            Console.WriteLine($"> Model: {modelType.Name}");

            // Search for the matching template in /wwwroot/Templates
            String? templatePath = Directory.EnumerateFiles(templateDirectory, "*.cshtml", SearchOption.AllDirectories)
                                            .FirstOrDefault(path =>
                                            {
                                                String? firstLine = File.ReadLines(path).FirstOrDefault()?.Trim();
                                                return firstLine == $"@model {modelType.FullName}";
                                            });

            if (String.IsNullOrWhiteSpace(templatePath))
            {
                throw new NoTemplateMatchingModelException(modelType.FullName, templateDirectory);
            }

            Console.WriteLine($"> Template: {Path.GetFileName(templatePath)}\n");

            String templateHash = GenerationManifest.ComputeTemplateHash(templatePath);

            // Handle the compact and extended modes of the cards
            List<ExtendableCardGenerationEnum> cardVersions = new List<ExtendableCardGenerationEnum>();

            if (records[0] is ExtendableCardModel)
            {
                Console.WriteLine("\n> The template has a shortened and extended version.");
                Console.Write("> Type 1 to generate the shortened version, 2 for the extended version and 3 for both: ");

                Boolean isValid = false;

                while (!isValid)
                {
                    String input = Console.ReadLine()!;

                    if (Int32.TryParse(input, out Int32 number))
                    {
                        switch (number)
                        {
                            case 1:
                                cardVersions.Add(ExtendableCardGenerationEnum.Shortened);
                                isValid = true;
                                break;
                            case 2:
                                cardVersions.Add(ExtendableCardGenerationEnum.Extended);
                                isValid = true;
                                break;
                            case 3:
                                cardVersions.Add(ExtendableCardGenerationEnum.Shortened);
                                cardVersions.Add(ExtendableCardGenerationEnum.Extended);
                                isValid = true;
                                break;
                            default:
                                Console.WriteLine("The number must be between 1 and 3.");
                                break;
                        }
                    }
                    else
                    {
                        Console.WriteLine("Invalid entry. Please enter a number.");
                    }
                }
            }
            else
            {
                cardVersions.Add(ExtendableCardGenerationEnum.NotExtendable);
            }

            foreach (ExtendableCardGenerationEnum version in cardVersions)
            {
                switch (version)
                {
                    case ExtendableCardGenerationEnum.NotExtendable:
                        break;
                    case ExtendableCardGenerationEnum.Shortened:
                        Console.WriteLine("\n> Shortened version :");
                        csvOutputVersionDir = Path.Combine(csvOutputDir, "shortened");
                        Directory.CreateDirectory(csvOutputVersionDir);
                        records.ForEach(x => { if (x is ExtendableCardModel ext) ext.IsExtended = false; });
                        break;
                    case ExtendableCardGenerationEnum.Extended:
                        Console.WriteLine("\n> Extended version :");
                        csvOutputVersionDir = Path.Combine(csvOutputDir, "extended");
                        Directory.CreateDirectory(csvOutputVersionDir);
                        records.ForEach(x => { if (x is ExtendableCardModel ext) ext.IsExtended = true; });
                        break;
                }

                Int32 index = 1;
                Int32 skippedCount = 0;

                foreach (CardModel record in records)
                {
                    String outputFilePath = Path.Combine(csvOutputVersionDir ?? csvOutputDir, $"{Path.GetFileNameWithoutExtension(csvPath)}_{record.CodeSnakeCase}.png");
                    String versionKey = version == ExtendableCardGenerationEnum.NotExtendable ? "default" : version.ToString().ToLower();
                    String manifestKey = $"{Path.GetFileNameWithoutExtension(csvPath)}/{versionKey}/{record.CodeSnakeCase}";
                    String dataHash = GenerationManifest.ComputeRecordHash(record);

                    if (manifest.IsUpToDate(manifestKey, dataHash, templateHash) && File.Exists(outputFilePath))
                    {
                        Console.Write($"\r> Card {index++}/{records.Count}: up to date, skipping ...    ");
                        skippedCount++;
                        continue;
                    }

                    Console.Write($"\r> Generating card {index++}/{records.Count} ...                   ");
                    totalRecordsCount++;

                    record.BaseHref = baseHref;
                    String html = await templateRenderer.RenderTemplateAsync(templatePath, record);

                    //// FOR TEMPLATE DEVELOPMENT ONLY
                    //// Display in a persistent Chrome window
                    //DevRenderer devRenderer = new DevRenderer();
                    //await devRenderer.ShowHtmlAsync(html, 1300);
                    ////await devRenderer.ShowHtmlAsync(html, 500, "Mockups/Company-Card.png");
                    //return;

                    await imageRenderer.RenderHtmlToImageAsync(html, outputFilePath);
                    manifest.Update(manifestKey, dataHash, templateHash);
                }

                Console.Write($"\r                                                              ");
                Console.WriteLine($"\r> Generation completed! ({records.Count - skippedCount} generated, {skippedCount} skipped)");
                Console.WriteLine($"> Output folder: {csvOutputVersionDir ?? csvOutputDir}");
                totalSkippedCount += skippedCount;
            }
        }
        else
        {
            throw new FileLoadException("CSV is empty", csvPath);
        }
        Console.WriteLine("\n - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -\n");
    }

    Console.WriteLine($"All cards have been successfully generated!");
    Console.WriteLine($"Input files processed: {csvFilePaths.Count}");
    Console.WriteLine($"Cards generated: {totalRecordsCount}");
    Console.WriteLine($"Cards skipped (up to date): {totalSkippedCount}");
    manifest.Save();
    await imageRenderer.CloseAsync();
    Console.ReadKey();
}
catch (Exception ex)
{
    Console.WriteLine($"\n============================ ERROR! ============================\n");
    Console.WriteLine(ex.ToString());
    Console.WriteLine($"\n================================================================");
    Console.ReadKey();
}