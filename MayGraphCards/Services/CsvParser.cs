using CsvHelper;
using CsvHelper.Configuration;
using Humanizer;
using MayGraphCards.Exceptions;
using MayGraphCards.Models;
using System.Globalization;
using System.Reflection;
using Unidecode.NET;

namespace MayGraphCards.Services
{
    public class CsvParser
    {
        private readonly CsvConfiguration _config;
        private readonly String _delimiter;

        public CsvParser(String delimiter)
        {
            _delimiter = delimiter;
            _config = new CsvConfiguration(CultureInfo.InvariantCulture)
            {
                HeaderValidated = null,
                MissingFieldFound = null,
                Delimiter = delimiter,
                // Lowercase both CSV header and member name so "serialNumber", "Serial Number", and "SerialNumber" all match.
                PrepareHeaderForMatch = args => this.NormalizeHeader(args.Header).ToLower()
            };
        }

        public List<CardModel> ParseCsv(String csvPath)
        {
            String? headerLine = File.ReadLines(csvPath).FirstOrDefault();
            if (headerLine == null)
                throw new FileNotFoundException("CSV empty or inaccessible", csvPath);

            // Normalize the headers
            var headers = NormalizeHeaders(headerLine.Split(_delimiter).ToList());

            // Find all models inheriting from CardModel, most specific first (most declared properties)
            List<Type> modelTypes = Assembly.GetExecutingAssembly()
                .GetTypes()
                .Where(t => typeof(CardModel).IsAssignableFrom(t) && !t.IsAbstract)
                .OrderByDescending(t => t.GetProperties(BindingFlags.Public | BindingFlags.Instance | BindingFlags.DeclaredOnly).Length)
                .ToList();

            // Primary: try filename-based matching (convention: city_government.csv or city-government.csv → CityGovernmentCardModel).
            // This takes priority over header-based matching to avoid ambiguity between similar models.
            // Replace hyphens with underscores before Pascalize — Humanizer only recognises _ and space as word separators, not -.
            string stem = Path.GetFileNameWithoutExtension(csvPath);
            string conventionalTypeName = stem.Replace("-", "_").Unidecode().Pascalize() + "CardModel";
            Type? filenameMatch = modelTypes.FirstOrDefault(t =>
                t.Name.Equals(conventionalTypeName, StringComparison.OrdinalIgnoreCase));

            if (filenameMatch != null)
            {
                var propsSet = new HashSet<string>(
                    filenameMatch.GetProperties(BindingFlags.Public | BindingFlags.Instance | BindingFlags.DeclaredOnly)
                                 .Select(p => p.Name),
                    StringComparer.OrdinalIgnoreCase);
                // Only use the filename match if all CSV headers are recognized by that model
                if (headers.All(h => propsSet.Contains(h)))
                {
                    using var reader = new StreamReader(csvPath);
                    using var csv = new CsvReader(reader, _config);
                    return csv.GetRecords(filenameMatch).Cast<CardModel>().ToList();
                }
            }

            // Fallback: header-based matching (backwards-compatible with existing CSVs like
            // certifications.csv, cities.csv, companies.csv whose names are plural/different)
            foreach (Type modelType in modelTypes)
            {
                // Only use properties declared directly on this model (excludes BaseHref, CodeSnakeCase, IsExtended from base classes)
                var normalizedPropsSet = new HashSet<string>(
                    modelType.GetProperties(BindingFlags.Public | BindingFlags.Instance | BindingFlags.DeclaredOnly)
                             .Select(x => x.Name),
                    StringComparer.OrdinalIgnoreCase);

                if (headers.All(h => normalizedPropsSet.Contains(h)))
                {
                    using var reader = new StreamReader(csvPath);
                    using var csv = new CsvReader(reader, _config);
                    var records = csv.GetRecords(modelType);
                    return records.Cast<CardModel>().ToList();
                }
            }
            throw new NoModelMatchingCsvException(Path.GetFileName(csvPath));
        }

        private String NormalizeHeader(String header) => header.Trim().Unidecode().Pascalize();

        private List<String> NormalizeHeaders(List<String> headers) => headers.Where(h => !String.IsNullOrWhiteSpace(h)).Select(h => this.NormalizeHeader(h)).ToList();
    }
}