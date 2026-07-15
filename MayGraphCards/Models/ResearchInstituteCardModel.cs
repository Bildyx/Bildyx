using System;

namespace MayGraphCards.Models
{
    public class ResearchInstituteCardModel : CardModel
    {
        public override String Code => this.SerialNumber;
        public String SerialNumber { get; set; }
        public String ResearchFocus { get; set; }
        public String KeyResearchOutputs { get; set; }
        public String ResearchInstituteName { get; set; }
        public String? Capital { get; set; }
    }
}
