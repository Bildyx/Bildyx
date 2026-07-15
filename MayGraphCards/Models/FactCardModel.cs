namespace MayGraphCards.Models
{
    public class FactCardModel : CardModel
    {
        public override String Code => this.SerialNumber;
        public String SerialNumber { get; set; }
        public String? Title { get; set; }
        public String? Icon1 { get; set; }
        public String? Hashtag1 { get; set; }
        public String? Hashtag2 { get; set; }
        public String? Story { get; set; }
    }
}