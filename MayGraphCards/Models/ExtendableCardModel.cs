namespace MayGraphCards.Models
{
    public abstract class ExtendableCardModel : CardModel
    {
        public Boolean IsExtended { get; set; } = false;
    }
}