namespace MayGraphCards.Configurations
{
    public class R2Settings
    {
        public bool Enabled { get; set; }
        public string AccountId { get; set; } = string.Empty;
        public string AccessKeyId { get; set; } = string.Empty;
        public string SecretAccessKey { get; set; } = string.Empty;
        public string BucketName { get; set; } = string.Empty;
        public int MaxConcurrentUploads { get; set; } = 10;
    }
}
