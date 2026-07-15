namespace MayGraphCards.Exceptions
{
    public class NoModelMatchingCsvException : Exception
    {
        public NoModelMatchingCsvException(String csvName)
            : base($"No model could be matched with the CSV {csvName}") { }
    }
}