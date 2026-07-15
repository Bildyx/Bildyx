namespace MayGraphCards.Configurations
{
    public class AppSettings
    {
        public String InputDirectory { get; set; } = String.Empty; // Folder containing the .csv files
        public String OutputDirectory { get; set; } = String.Empty; // Folder where to save the images
        public String CsvDelimiter { get; set; } = String.Empty; // Delimiter for csv file (fr=; & en=,)
        public String? BrowserPath { get; set; } // Absolute path to the Chrome browser (not required)
        public R2Settings? R2 { get; set; }
    }

}
