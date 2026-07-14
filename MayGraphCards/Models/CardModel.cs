using Humanizer;
using Unidecode.NET;

namespace MayGraphCards.Models
    {
    public abstract class CardModel
    {
        public String? BaseHref { get; set; } // Path of wwwroot

        public abstract String Code { get; } // Unique name

        public String CodeSnakeCase // snake_case name safe for file paths
        {
            get => this.GetSnakeCase(this.Code);
        }

        protected String GetSnakeCase(String value)
        {
            return String.Concat(value
                    .Unidecode()
                    .Underscore()
                    .Where(c => !Path.GetInvalidFileNameChars().Contains(c)));
        }
    }
}