namespace MayGraphCards.Models
{
    public class UniversityCardModel : CardModel
    {
        public override String Code => this.SerialNumber;
        public String SerialNumber { get; set; }
        public String Name { get; set; }
        public String? Established { get; set; }
        public String? Type { get; set; }
        public String? Location { get; set; }
        public String? TotalStudents { get; set; }
        public String? Undergraduates { get; set; }
        public String? Postgraduates { get; set; }
        public String? Notes { get; set; }
    }
}