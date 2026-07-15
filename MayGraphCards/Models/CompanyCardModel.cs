namespace MayGraphCards.Models
{
    public class CompanyCardModel : CardModel
    {
        public override String Code => this.SerialNumber;
        public String SerialNumber { get; set; }
        public String OrganizationName { get; set; }
        public String? Category { get; set; }
        public String? Industry { get; set; }
        public String? Products { get; set; }
        public String? CompanyType { get; set; }
        public String? NumberOfEmployees { get; set; }
        public String? Founded { get; set; }
        public String? HeadquartersLocation { get; set; }
        public String? Parent { get; set; }
        public String? NumberOfOffices { get; set; }
        public String? Subsidiaries { get; set; }
        public String? KnownFor { get; set; }
    }
}