namespace MayGraphCards.Models
{
    public class ProductCardModel : CardModel
    {
        public override String Code => this.SerialNumber;
        public String SerialNumber { get; set; }
        public String NameOfProduct { get; set; }
        public String? Type { get; set; }
        public String? Company { get; set; }
        public String? ProductType { get; set; }
        public String? Description { get; set; }
        public String? Industries { get; set; }
        public String? Competitors { get; set; }
        public String? FunFact { get; set; }
    }
}











