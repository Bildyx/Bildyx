namespace MayGraphCards.Models
{
    public class SkillCardModel : CardModel
    {
        public override String Code => this.SerialNumber;
        public String SerialNumber { get; set; }
        public String Name { get; set; }
        public String? Type { get; set; }
        public String? SkillCategories { get; set; }
        public String? UsedIn { get; set; }
        public String? JobOccupations { get; set; }
        public String? Industry { get; set; }
        public String? ProductCategory { get; set; }
        public String? CommonFieldsOfStudy { get; set; }
        public String? RelatedAbilities { get; set; }
        public String? TimeToMasterIt { get; set; }
    }
}