using Amazon.S3;
using Amazon.S3.Model;

namespace MayGraphCards.Services
{
    public class R2StorageService : IDisposable
    {
        private readonly AmazonS3Client _client;
        private readonly string _bucketName;
        private readonly SemaphoreSlim _semaphore;

        public R2StorageService(string accountId, string accessKeyId, string secretAccessKey, string bucketName, int maxConcurrentUploads = 10)
        {
            _bucketName = bucketName;
            _semaphore = new SemaphoreSlim(maxConcurrentUploads, maxConcurrentUploads);

            var config = new AmazonS3Config
            {
                ServiceURL = $"https://{accountId}.r2.cloudflarestorage.com",
                ForcePathStyle = true,
                Timeout = TimeSpan.FromSeconds(15)
            };
            _client = new AmazonS3Client(accessKeyId, secretAccessKey, config);
        }

        public async Task UploadBytesAsync(string key, byte[] data, string contentType = "image/png")
        {
            await _semaphore.WaitAsync();
            try
            {
                int attempts = 0;
                while (true)
                {
                    try
                    {
                        // Explicit per-attempt timeout: AmazonS3Config.Timeout does not reliably
                        // abort streaming PUT operations at the TCP level on all platforms.
                        using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(30));
                        using var stream = new MemoryStream(data);
                        await _client.PutObjectAsync(new PutObjectRequest
                        {
                            BucketName = _bucketName,
                            Key = key,
                            InputStream = stream,
                            ContentType = contentType,
                            DisablePayloadSigning = true
                        }, cts.Token);
                        return;
                    }
                    catch when (++attempts < 3)
                    {
                        await Task.Delay(1000 * attempts);
                    }
                }
            }
            finally
            {
                _semaphore.Release();
            }
        }

        public async Task<HashSet<string>> ListObjectKeysAsync(CancellationToken ct = default)
        {
            var keys = new HashSet<string>();
            string? continuationToken = null;
            do
            {
                var request = new ListObjectsV2Request
                {
                    BucketName = _bucketName,
                    ContinuationToken = continuationToken
                };
                var response = await _client.ListObjectsV2Async(request, ct);
                foreach (var obj in response.S3Objects)
                    keys.Add(obj.Key);
                continuationToken = response.IsTruncated == true ? response.NextContinuationToken : null;
            }
            while (continuationToken != null);
            return keys;
        }

        public async Task<byte[]?> DownloadBytesAsync(string key, CancellationToken ct = default)
        {
            try
            {
                var request = new GetObjectRequest { BucketName = _bucketName, Key = key };
                using var response = await _client.GetObjectAsync(request, ct);
                using var ms = new MemoryStream();
                await response.ResponseStream.CopyToAsync(ms, ct);
                return ms.ToArray();
            }
            catch
            {
                // Treat any failure (404, auth error, timeout, cancellation) as "not found"
                // so a missing or unreachable manifest never blocks generation startup
                return null;
            }
        }

        public void Dispose()
        {
            _client.Dispose();
            _semaphore.Dispose();
        }
    }
}
