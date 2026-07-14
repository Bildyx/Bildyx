using System.Reflection;
using System.Text;
using System.Text.RegularExpressions;
using MayGraphCards.Models;

namespace MayGraphCards.Dashboard;

public class CreateCardTypeRequest
{
    public string Name { get; set; } = "";
    public bool IsExtendable { get; set; }
    public List<string> FixedRequired { get; set; } = new();
    public List<string> FixedOptional { get; set; } = new();
    public List<string> ExtendedRequired { get; set; } = new();
    public List<string> ExtendedOptional { get; set; } = new();
    public Dictionary<string, string> Icons { get; set; } = new(); // propName → iconFilename
    public string? GroupName { get; set; } // optional group to assign the new card type to
}

public class CardTypeDetails
{
    public string Name { get; set; } = "";
    public bool IsExtendable { get; set; }
    public List<string> FixedRequired { get; set; } = new();
    public List<string> FixedOptional { get; set; } = new();
    public List<string> ExtendedRequired { get; set; } = new();
    public List<string> ExtendedOptional { get; set; } = new();
    public Dictionary<string, string> Icons { get; set; } = new();
}

public class ModifyCardTypeRequest
{
    public string OriginalName { get; set; } = "";
    public string NewName { get; set; } = "";
    public bool IsExtendable { get; set; }
    public List<string> FixedRequired { get; set; } = new();
    public List<string> FixedOptional { get; set; } = new();
    public List<string> ExtendedRequired { get; set; } = new();
    public List<string> ExtendedOptional { get; set; } = new();
    public Dictionary<string, string> Icons { get; set; } = new();
    public string? GroupName { get; set; } // null = no change, "" = remove from group, "GroupName" = assign
}

public static class CardTypeCreator
{
    public static (bool success, string message) CreateCardType(CreateCardTypeRequest req)
    {
        string? projectRoot = FindProjectRoot();
        if (projectRoot is null)
            return (false, "Could not find the project source directory.");

        // Sanitize all user-supplied strings to valid C# identifiers before any code generation.
        // Prevents CS1003/CS1002/CS1519 when the user types names with spaces or special chars.
        string sanitizedName = SanitizePropertyName(req.Name.Trim());
        req.FixedRequired    = req.FixedRequired.Select(SanitizePropertyName).ToList();
        req.FixedOptional    = req.FixedOptional.Select(SanitizePropertyName).ToList();
        req.ExtendedRequired = req.ExtendedRequired.Select(SanitizePropertyName).ToList();
        req.ExtendedOptional = req.ExtendedOptional.Select(SanitizePropertyName).ToList();
        req.Icons            = req.Icons.ToDictionary(kv => SanitizePropertyName(kv.Key), kv => kv.Value);

        string className = sanitizedName + "CardModel";
        string kebabName = ToKebabCase(sanitizedName);

        string modelPath    = Path.Combine(projectRoot, "Models",               $"{className}.cs");
        string templatePath = Path.Combine(projectRoot, "wwwroot", "Templates", $"{kebabName}-card.cshtml");

        if (File.Exists(modelPath))
            return (false, $"A model named '{className}' already exists.");

        File.WriteAllText(modelPath,    GenerateModel(req, className),             Encoding.UTF8);
        File.WriteAllText(templatePath, GenerateTemplate(req, className, kebabName), Encoding.UTF8);

        return (true, "Files created successfully.");
    }

    public static string? GetProjectRoot() => FindProjectRoot();

    public static (bool success, string message) DeleteCardType(string name)
    {
        string? projectRoot = FindProjectRoot();
        if (projectRoot is null)
            return (false, "Could not find the project source directory.");

        string className = name + "CardModel";
        string kebabName = ToKebabCase(name);

        string modelPath    = Path.Combine(projectRoot, "Models",               $"{className}.cs");
        string templatePath = Path.Combine(projectRoot, "wwwroot", "Templates", $"{kebabName}-card.cshtml");

        if (!File.Exists(modelPath) && !File.Exists(templatePath))
            return (false, $"Card type '{name}' not found.");

        if (File.Exists(modelPath))    File.Delete(modelPath);
        if (File.Exists(templatePath)) File.Delete(templatePath);

        return (true, $"Card type '{name}' deleted.");
    }

    public static CardTypeDetails? GetCardTypeDetails(string name)
    {
        string? projectRoot = FindProjectRoot();
        if (projectRoot is null) return null;

        var type = Assembly.GetExecutingAssembly()
            .GetTypes()
            .FirstOrDefault(t => t.Name == name + "CardModel"
                              && typeof(CardModel).IsAssignableFrom(t)
                              && !t.IsAbstract);
        if (type is null) return null;

        bool isExtendable = typeof(ExtendableCardModel).IsAssignableFrom(type);
        var nullability = new NullabilityInfoContext();

        var allProps = type
            .GetProperties(BindingFlags.Public | BindingFlags.Instance | BindingFlags.DeclaredOnly)
            .Where(p => p.CanWrite)
            .Select(p => (Name: p.Name, IsOptional: nullability.Create(p).WriteState == NullabilityState.Nullable))
            .ToList();

        var extendedPropNames = new HashSet<string>(StringComparer.Ordinal);
        var iconMap = new Dictionary<string, string>(StringComparer.Ordinal);

        string kebabName = ToKebabCase(name);
        string templatePath = Path.Combine(projectRoot, "wwwroot", "Templates", $"{kebabName}-card.cshtml");

        if (File.Exists(templatePath))
        {
            var lines = File.ReadAllLines(templatePath);

            // Identify extended-only properties for extendable cards
            if (isExtendable)
            {
                bool inExtendedBlock = false;
                int depth = 0;
                foreach (string line in lines)
                {
                    string trimmed = line.Trim();
                    if (!inExtendedBlock)
                    {
                        if (trimmed.StartsWith("@if (Model.IsExtended)"))
                        {
                            inExtendedBlock = true;
                            depth = 0;
                        }
                    }
                    else
                    {
                        if (trimmed == "{") { depth++; continue; }
                        if (trimmed == "}") { depth--; if (depth <= 0) break; continue; }
                        foreach (Match m in Regex.Matches(line, @"Model\.([A-Za-z]+)"))
                            extendedPropNames.Add(m.Groups[1].Value);
                    }
                }
            }

            // Parse icon associated with each property
            for (int i = 0; i < lines.Length; i++)
            {
                Match valueMatch = Regex.Match(lines[i], @"class=""info-value"">@Model\.([A-Za-z]+)<");
                if (!valueMatch.Success) continue;

                string propName = valueMatch.Groups[1].Value;
                for (int j = i - 1; j >= Math.Max(0, i - 5); j--)
                {
                    Match iconMatch = Regex.Match(lines[j], @"<img src=""Images/icons/([^""]+)""");
                    if (iconMatch.Success)
                    {
                        iconMap[propName] = iconMatch.Groups[1].Value;
                        break;
                    }
                }
            }
        }

        var details = new CardTypeDetails { Name = name, IsExtendable = isExtendable, Icons = iconMap };
        foreach (var (pName, isOptional) in allProps)
        {
            if (extendedPropNames.Contains(pName))
            {
                if (isOptional) details.ExtendedOptional.Add(pName);
                else details.ExtendedRequired.Add(pName);
            }
            else
            {
                if (isOptional) details.FixedOptional.Add(pName);
                else details.FixedRequired.Add(pName);
            }
        }

        return details;
    }

    public static (bool success, string message) ModifyCardType(ModifyCardTypeRequest req)
    {
        string? projectRoot = FindProjectRoot();
        if (projectRoot is null)
            return (false, "Could not find the project source directory.");

        string origClassName = req.OriginalName + "CardModel";
        string origKebab = ToKebabCase(req.OriginalName);
        string origModelPath    = Path.Combine(projectRoot, "Models", $"{origClassName}.cs");
        string origTemplatePath = Path.Combine(projectRoot, "wwwroot", "Templates", $"{origKebab}-card.cshtml");

        string newName = SanitizePropertyName(req.NewName.Trim());
        string newClassName = newName + "CardModel";
        string newKebab = ToKebabCase(newName);
        string newModelPath    = Path.Combine(projectRoot, "Models", $"{newClassName}.cs");
        string newTemplatePath = Path.Combine(projectRoot, "wwwroot", "Templates", $"{newKebab}-card.cshtml");

        bool nameChanged = !string.Equals(req.OriginalName, newName, StringComparison.Ordinal);
        if (nameChanged && File.Exists(newModelPath))
            return (false, $"A card type named '{newName}' already exists.");

        if (File.Exists(origModelPath))    File.Delete(origModelPath);
        if (File.Exists(origTemplatePath)) File.Delete(origTemplatePath);

        var createReq = new CreateCardTypeRequest
        {
            Name = newName,
            IsExtendable = req.IsExtendable,
            FixedRequired    = req.FixedRequired.Select(SanitizePropertyName).ToList(),
            FixedOptional    = req.FixedOptional.Select(SanitizePropertyName).ToList(),
            ExtendedRequired = req.ExtendedRequired.Select(SanitizePropertyName).ToList(),
            ExtendedOptional = req.ExtendedOptional.Select(SanitizePropertyName).ToList(),
            Icons = req.Icons.ToDictionary(kv => SanitizePropertyName(kv.Key), kv => kv.Value),
        };

        File.WriteAllText(newModelPath,    GenerateModel(createReq, newClassName),              Encoding.UTF8);
        File.WriteAllText(newTemplatePath, GenerateTemplate(createReq, newClassName, newKebab), Encoding.UTF8);

        return (true, "Card type updated successfully.");
    }

    private static string? FindProjectRoot()
    {
        string? dir = AppContext.BaseDirectory;
        while (dir is not null)
        {
            if (Directory.GetFiles(dir, "*.csproj").Length > 0) return dir;
            dir = Directory.GetParent(dir)?.FullName;
        }
        return null;
    }

    private static string GenerateModel(CreateCardTypeRequest req, string className)
    {
        string baseClass = req.IsExtendable ? "ExtendableCardModel" : "CardModel";
        string codeProperty = req.FixedRequired.FirstOrDefault() ?? "SerialNumber";

        var sb = new StringBuilder();
        // Explicit usings protect against CS0012 in self-contained and Windows publish modes
        // where implicit usings may not propagate correctly into Roslyn dynamic compilation.
        sb.AppendLine("using System;");
        sb.AppendLine("");
        sb.AppendLine("namespace MayGraphCards.Models");
        sb.AppendLine("{");
        sb.AppendLine($"    public class {className} : {baseClass}");
        sb.AppendLine("    {");
        sb.AppendLine($"        public override String Code => this.{SanitizePropertyName(codeProperty)};");

        foreach (string p in req.FixedRequired)
            sb.AppendLine($"        public String {SanitizePropertyName(p)} {{ get; set; }}");

        foreach (string p in req.FixedOptional)
            sb.AppendLine($"        public String? {SanitizePropertyName(p)} {{ get; set; }}");

        if (req.IsExtendable)
        {
            foreach (string p in req.ExtendedRequired)
                sb.AppendLine($"        public String {SanitizePropertyName(p)} {{ get; set; }}");

            foreach (string p in req.ExtendedOptional)
                sb.AppendLine($"        public String? {SanitizePropertyName(p)} {{ get; set; }}");
        }

        sb.AppendLine("    }");
        sb.AppendLine("}");
        return sb.ToString();
    }

    private static string GenerateTemplate(CreateCardTypeRequest req, string className, string kebabName)
    {
        string fullClass = $"MayGraphCards.Models.{className}";
        // Prefer the first property whose name contains "Name"; fall back to first non-SerialNumber; then SerialNumber
        var allProps = req.FixedRequired
            .Concat(req.FixedOptional)
            .Concat(req.ExtendedRequired)
            .Concat(req.ExtendedOptional)
            .ToList();
        string titleProp = allProps.FirstOrDefault(p => p.Contains("Name", StringComparison.OrdinalIgnoreCase))
            ?? allProps.FirstOrDefault(p => p != "SerialNumber")
            ?? "SerialNumber";

        string GetIcon(string propName) =>
            req.Icons.TryGetValue(propName, out string? icon) && !string.IsNullOrWhiteSpace(icon)
                ? icon : "notes.png";

        var sb = new StringBuilder();
        sb.AppendLine($"@model {fullClass}");
        sb.AppendLine("@using System");
        sb.AppendLine("<!DOCTYPE html>");
        sb.AppendLine("<html lang=\"en\">");
        sb.AppendLine("<head>");
        sb.AppendLine("    <base href=\"@Model.BaseHref\" />");
        sb.AppendLine("    <meta charset=\"UTF-8\">");
        sb.AppendLine($"    <title>@Model.{titleProp} - Card</title>");
        sb.AppendLine("    <style>");
        sb.AppendLine("        @@font-face {");
        sb.AppendLine("            font-family: 'Bebas Neue Pro';");
        sb.AppendLine("            src: url('Fonts/BebasNeuePro-Bold.woff2') format('woff2');");
        sb.AppendLine("            font-weight: bold;");
        sb.AppendLine("        }");
        sb.AppendLine("        @@font-face {");
        sb.AppendLine("            font-family: 'Work Sans';");
        sb.AppendLine("            src: url('Fonts/WorkSans-Regular.woff2') format('woff2');");
        sb.AppendLine("        }");
        sb.AppendLine("        html, body { width: 500px; margin: 0; padding: 0; font-family: 'Work Sans', Arial, sans-serif; background-color: transparent; }");
        sb.AppendLine("        .main-card { width: 100%; background: #fdfdfd; border: 3px solid #396bb3; border-radius: 60px; padding: 35px 40px; box-sizing: border-box; display: flex; flex-direction: column; position: relative; }");
        sb.AppendLine("        .main-card::after { content: \"\"; position: absolute; top: 20px; left: 25px; right: 25px; bottom: 20px; border-radius: 50px; border: 3px solid #396bb3; pointer-events: none; }");
        sb.AppendLine("        .header { display: flex; align-items: center; gap: 18px; border-radius: 40px; border: 3px solid #396bb3; padding: 5px 10px; }");
        sb.AppendLine("        .maygraph-logo img { width: 70px; height: 70px; object-fit: contain; padding: 4px; }");
        sb.AppendLine("        .card-title { font-family: 'Bebas Neue Pro', sans-serif; font-size: 2.2rem; color: #1d1d1b; font-weight: bold; letter-spacing: 0.5px; }");
        sb.AppendLine("        .info-table { display: flex; flex-direction: column; gap: 15px; padding: 15px 20px 5px; }");
        sb.AppendLine("        .info-row { display: flex; align-items: center; gap: 14px; }");
        sb.AppendLine("        .info-icon img { width: 40px; height: 40px; object-fit: contain; }");
        sb.AppendLine("        .info-label { flex: 1 1 130px; font-size: 1.10rem; color: #090b28; font-weight: 500; }");
        sb.AppendLine("        .info-value { flex: 1.1 1 180px; color: #00448c; font-size: 1.12rem; font-weight: 500; word-break: break-word; }");
        sb.AppendLine("        .footer-row { display: flex; justify-content: space-between; position: relative; margin-top: 15px; padding: 0 20px; }");
        sb.AppendLine("        .serial-number { position: absolute; left: 50%; transform: translateX(-50%); text-align: center; color: #1d1d1b; }");
        sb.AppendLine("        .copyright { margin-left: auto; color: #1d1d1b; font-weight: bold; }");

        if (req.IsExtendable)
        {
            sb.AppendLine($"        html, body {{ width: 1300px; }}");
            sb.AppendLine($"        body.extended {{ width: 1800px; }}");
        }

        sb.AppendLine("    </style>");
        sb.AppendLine("</head>");

        if (req.IsExtendable)
        {
            sb.AppendLine("    @{ var bodyClass = Model.IsExtended ? \"extended\" : \"\"; }");
            sb.AppendLine("<body class=\"@bodyClass\">");
        }
        else
            sb.AppendLine("<body>");

        sb.AppendLine("    <div class=\"main-card\">");
        sb.AppendLine("        <div class=\"header\">");
        sb.AppendLine("            <div class=\"maygraph-logo\"><img src=\"Images/logos/Logo-MayGraph_Big1.png\" /></div>");
        sb.AppendLine($"            <div class=\"card-title\">@Model.{titleProp}</div>");
        sb.AppendLine("        </div>");
        sb.AppendLine("        <div class=\"info-table\">");

        // SerialNumber is shown in the footer; titleProp is shown in the header — exclude both from body rows.
        bool IsBodyProp(string p) => p != "SerialNumber" && p != titleProp;

        foreach (string p in req.FixedRequired.Where(IsBodyProp))
            AppendInfoRow(sb, p, optional: false, iconFile: GetIcon(p));

        foreach (string p in req.FixedOptional.Where(IsBodyProp))
            AppendInfoRow(sb, p, optional: true, iconFile: GetIcon(p));

        if (req.IsExtendable && (req.ExtendedRequired.Any() || req.ExtendedOptional.Any()))
        {
            sb.AppendLine("            @if (Model.IsExtended)");
            sb.AppendLine("            {");
            foreach (string p in req.ExtendedRequired.Where(IsBodyProp))
                AppendInfoRow(sb, p, optional: false, iconFile: GetIcon(p), indent: "                ");
            foreach (string p in req.ExtendedOptional.Where(IsBodyProp))
                AppendInfoRow(sb, p, optional: true, iconFile: GetIcon(p), indent: "                ");
            sb.AppendLine("            }");
        }

        sb.AppendLine("        </div>");
        sb.AppendLine("        <div class=\"footer-row\">");
        sb.AppendLine("            <span class=\"serial-number\">" + "@($\"#{Model.SerialNumber}\")" + "</span>");
        sb.AppendLine("            <span class=\"copyright\">@($\"©{DateTime.Now.Year}\")</span>");
        sb.AppendLine("        </div>");
        sb.AppendLine("    </div>");
        sb.AppendLine("</body>");
        sb.AppendLine("</html>");

        return sb.ToString();
    }

    private static void AppendInfoRow(StringBuilder sb, string propName, bool optional,
        string iconFile = "notes.png", string indent = "            ")
    {
        string label = PascalCaseToLabel(propName);
        string iconSrc = $"Images/icons/{iconFile}";

        if (optional)
        {
            sb.AppendLine($"{indent}@if (!String.IsNullOrWhiteSpace(Model.{propName}))");
            sb.AppendLine($"{indent}{{");
            sb.AppendLine($"{indent}    <div class=\"info-row\">");
            sb.AppendLine($"{indent}        <div class=\"info-icon\"><img src=\"{iconSrc}\" /></div>");
            sb.AppendLine($"{indent}        <div class=\"info-label\">{label}</div>");
            sb.AppendLine($"{indent}        <div class=\"info-value\">@Model.{propName}</div>");
            sb.AppendLine($"{indent}    </div>");
            sb.AppendLine($"{indent}}}");
        }
        else
        {
            sb.AppendLine($"{indent}<div class=\"info-row\">");
            sb.AppendLine($"{indent}    <div class=\"info-icon\"><img src=\"{iconSrc}\" /></div>");
            sb.AppendLine($"{indent}    <div class=\"info-label\">{label}</div>");
            sb.AppendLine($"{indent}    <div class=\"info-value\">@Model.{propName}</div>");
            sb.AppendLine($"{indent}</div>");
        }
    }

    public static string PascalCaseToLabel(string name)
    {
        var sb = new StringBuilder();
        for (int i = 0; i < name.Length; i++)
        {
            if (i > 0 && char.IsUpper(name[i]) && !char.IsUpper(name[i - 1]))
                sb.Append(' ');
            sb.Append(name[i]);
        }
        return sb.ToString();
    }

    // Converts any user-supplied string to a valid PascalCase C# identifier.
    // "Number Of Researchers" → "NumberOfResearchers"
    // "research-index"        → "ResearchIndex"
    // "42answer"              → "_42answer"  (identifiers cannot start with a digit)
    public static string SanitizePropertyName(string raw)
    {
        var words = Regex.Split(raw.Trim(), @"[^a-zA-Z0-9]+")
                         .Where(w => w.Length > 0)
                         .Select(w => char.ToUpper(w[0]) + (w.Length > 1 ? w[1..] : ""));
        var result = string.Concat(words);
        if (result.Length == 0)       return "_Property";
        if (char.IsDigit(result[0]))  return "_" + result;
        return result;
    }

    public static string ToKebabCase(string name)
    {
        // Always sanitize first so spaces and special chars are removed before conversion.
        // "Research Institute" → SanitizePropertyName → "ResearchInstitute" → "research-institute"
        name = SanitizePropertyName(name);
        var sb = new StringBuilder();
        for (int i = 0; i < name.Length; i++)
        {
            if (char.IsUpper(name[i]) && i > 0) sb.Append('-');
            sb.Append(char.ToLower(name[i]));
        }
        return sb.ToString();
    }
}
