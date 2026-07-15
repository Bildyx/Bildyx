namespace MayGraphCards.Models
{
    public class CertificationCardModel : CardModel
    {
        public override String Code => this.SerialNumber;
        public String SerialNumber { get; set; }
        public String Name { get; set; }
        public String? Level { get; set; }
        public String? Description { get; set; }
        public String? IssuedBy { get; set; }
        public String? ProductRelated { get; set; }
        public String? JobsRelated { get; set; }
    }
}