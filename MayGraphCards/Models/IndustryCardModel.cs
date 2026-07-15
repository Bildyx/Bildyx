using System;

namespace MayGraphCards.Models
{
    public class IndustryCardModel : CardModel
    {
        public override String Code => this.SerialNumber;
        public String SerialNumber { get; set; }
        public String IndustryName { get; set; }
        public String? Description { get; set; }
        public String? MedianSalary { get; set; }
    }
}
