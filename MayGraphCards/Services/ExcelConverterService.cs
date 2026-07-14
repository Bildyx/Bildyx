using System.Data;
using System.Text;
using ExcelDataReader;

namespace MayGraphCards.Services;

public static class ExcelConverterService
{
    static ExcelConverterService()
    {
        // Required on non-Windows platforms (macOS/Linux) for ExcelDataReader encoding support
        Encoding.RegisterProvider(CodePagesEncodingProvider.Instance);
    }

    // Converts the first sheet of an Excel file to a semicolon-delimited CSV (UTF-8 with BOM).
    public static void ConvertToCsv(string excelPath, string csvPath, string delimiter)
    {
        using var stream = File.Open(excelPath, FileMode.Open, FileAccess.Read, FileShare.ReadWrite);
        using var reader = ExcelReaderFactory.CreateReader(stream);

        var dataSet = reader.AsDataSet(new ExcelDataSetConfiguration
        {
            ConfigureDataTable = _ => new ExcelDataTableConfiguration { UseHeaderRow = true }
        });

        if (dataSet.Tables.Count == 0) return;

        DataTable table = dataSet.Tables[0];

        // UTF-8 with BOM to match the project's existing CSV encoding
        using var writer = new StreamWriter(csvPath, append: false,
            new UTF8Encoding(encoderShouldEmitUTF8Identifier: true));

        var headers = table.Columns.Cast<DataColumn>()
            .Select(c => EscapeField(c.ColumnName, delimiter));
        writer.WriteLine(string.Join(delimiter, headers));

        foreach (DataRow row in table.Rows)
        {
            // Skip entirely empty rows that Excel sometimes appends
            if (row.ItemArray.All(f => f is null or DBNull || string.IsNullOrWhiteSpace(f.ToString())))
                continue;

            var fields = row.ItemArray.Select(f => EscapeField(f?.ToString() ?? "", delimiter));
            writer.WriteLine(string.Join(delimiter, fields));
        }
    }

    private static string EscapeField(string value, string delimiter)
    {
        if (value.Contains(delimiter) || value.Contains('"') || value.Contains('\n') || value.Contains('\r'))
            return $"\"{value.Replace("\"", "\"\"")}\"";
        return value;
    }
}
