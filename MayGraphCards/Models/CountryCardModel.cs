namespace MayGraphCards.Models
{
    public class CountryCardModel : ExtendableCardModel
    {
        public override String Code => this.CountryName;
        public String CountryName { get; set; }
        public String SerialNumber { get; set; }
        public String? QualityOfLife { get; set; }
        public String? Temperatures { get; set; }
        public String? Climate { get; set; }
        public String? CrimeRate { get; set; }
        public String? IncomeInequality { get; set; }
        public String? WorkLifeBalance { get; set; }
        public String? Capital { get; set; }
        public String? MainCities { get; set; }
        public String? Population { get; set; }
        public String? InterestingFact { get; set; }
        public String? CitizenshipProcess { get; set; }
        public String? WorkPermit { get; set; }
        public String? GlobalCompetitivenessIndex { get; set; }
        public String? LevelOfGlobalization { get; set; }
        public String? NumberOfInternationalStudents { get; set; }
        public String? NumberOfForeignCompaniesThatHaveOffice { get; set; }
        public String? NumberOfTourists { get; set; }
        public String? NumberOfAirports { get; set; }
        public String? QualityOfPrimaryAndSecondaryEducation { get; set; }
        public String? DegreeHolders { get; set; }
        public String? NumberOfCollegesAndUniversities { get; set; }
        public String? TopUniversities { get; set; }
        public String? EthnicGroups { get; set; }
        public String? Languages { get; set; }
        public String? Religion { get; set; }
        public String? CulturalValues { get; set; }
        public String? PeopleDescription { get; set; }
        public String? Currency { get; set; }
        public String? MainIndustries { get; set; }
        public String? LargestCompanies { get; set; }
        public String? NumberOfMultinationalHQs { get; set; }
        public String? MedianSalary { get; set; }
        public String? PersonalIncomeTax { get; set; }
        public String? CostOfLiving { get; set; }
        public String? MedianHomePrice { get; set; }
        public String? AverageRent { get; set; }
    }
}
