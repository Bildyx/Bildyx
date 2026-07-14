namespace MayGraphCards.Models
{
    public class CityCardModel : CardModel
    {
        public override String Code => this.SerialNumber;
        public String SerialNumber { get; set; }
        public String CityName { get; set; }
        public String CityNameSnakeCase => this.GetSnakeCase(this.CityName);

        // General
        public String? Population { get; set; }

        // Economy and career
        public String? MainIndustries { get; set; }
        public String? NumberOfMultinationalHQs { get; set; }
        public String? NumberOfAirports { get; set; }
        public String? LargestCompanies { get; set; }

        // Housing and income
        public String? MedianSalary { get; set; }
        public String? CostOfLiving { get; set; }
        public String? MedianHomePrice { get; set; }
        public String? AverageRent { get; set; }

        // Weather
        public String? Temperatures { get; set; }
        public String? Climate { get; set; }

        // Interesting fact
        public String? InterestingFact { get; set; }

        // Education
        public String? DegreeHolders { get; set; }
        public String? NumberOfCollegesAndUniversities { get; set; }
        public String? TopUniversities { get; set; }

        // People
        public String? NumberOfNationalities { get; set; }
        public String? Languages { get; set; }
        public String? PeopleDescription { get; set; }
    }
}