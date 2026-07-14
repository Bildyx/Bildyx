namespace MayGraphCards.Models
{
    public class JobCardModel : CardModel
    {
        public override String Code => this.SerialNumber;
        public String SerialNumber { get; set; }
        public String JobName { get; set; }
        public String JobNameSnakeCase => this.GetSnakeCase(this.JobName);
        public String? Description { get; set; }
        public String? Products { get; set; }
        public String? ToolsAndTech { get; set; }
    }
}