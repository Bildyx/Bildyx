namespace MayGraphCards.Exceptions
{
    public class NoTemplateMatchingModelException : Exception
    {
        public NoTemplateMatchingModelException(String? modelFullName, String templateDirectory)
            : base($"No .cshtml template with '@model {modelFullName}' found in {templateDirectory}") { }
    }
}