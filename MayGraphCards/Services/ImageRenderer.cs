using PuppeteerSharp;

namespace MayGraphCards.Services
{
    public class ImageRenderer
    {
        internal LaunchOptions? LaunchOptions { get; private set; }

        private IBrowser? _browser;
        private readonly String? _browserPath;

        public ImageRenderer(String? browserPath = null)
        {
            _browserPath = browserPath;
        }

        private static String[] ChromeArgs => new[]
        {
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--allow-file-access-from-files",
            "--enable-local-file-accesses"
        };

        private async Task<LaunchOptions> GetLaunchOptionsAsync()
        {
            if (!String.IsNullOrWhiteSpace(this._browserPath))
            {
                // Explicit path provided by the user (Chrome installed)
                return new LaunchOptions
                {
                    Headless = true,
                    ExecutablePath = this._browserPath,
                    Args = ChromeArgs
                };
            }

            // Chromium cache management with PuppeteerSharp
            String buildId = "122.0.6261.0";
            BrowserFetcher fetcher = new BrowserFetcher();
            String exePath = fetcher.GetExecutablePath(buildId);

            // Download if Chromium is not found in cache
            if (!File.Exists(exePath))
            {
                Console.Write("Downloading Chromium to cache ...");
                await fetcher.DownloadAsync(buildId);
                Console.WriteLine("\rChromium download completed      ");
            }

            return new LaunchOptions
            {
                Headless = true,
                ExecutablePath = exePath,
                Args = ChromeArgs
            };
        }

        public async Task InitialisationAsync()
        {
            this.LaunchOptions = await GetLaunchOptionsAsync();
            this._browser = await Puppeteer.LaunchAsync(this.LaunchOptions);
        }

        public async Task RenderHtmlToImageAsync(String html, String outputPath)
        {
            // Write the HTML to a temporary file
            String tempHtmlPath = Path.Combine(Path.GetTempPath(), $"temp_{Guid.NewGuid()}.html");
            await File.WriteAllTextAsync(tempHtmlPath, html);
            String htmlUri = new Uri(tempHtmlPath).AbsoluteUri;

            // Reuse the shared browser instance — only open a new page per card
            using IPage page = await this._browser!.NewPageAsync();
            await page.SetViewportAsync(new ViewPortOptions { Width = 1, Height = 1, DeviceScaleFactor = 2 });

            // Load the HTML file
            await page.GoToAsync(htmlUri, WaitUntilNavigation.Networkidle0);

            // Screenshot
            await page.ScreenshotAsync(outputPath, new ScreenshotOptions
            {
                FullPage = true,
                OmitBackground = true,
                Type = ScreenshotType.Png
            });

            await page.CloseAsync();

            // Clean up the temporary file
            File.Delete(tempHtmlPath);
        }

        public async Task<byte[]> RenderHtmlToBytesAsync(String html)
        {
            // Render to a temp PNG then read bytes — reuses the proven RenderHtmlToImageAsync path
            String tempPngPath = Path.Combine(Path.GetTempPath(), $"card_{Guid.NewGuid()}.png");
            try
            {
                await RenderHtmlToImageAsync(html, tempPngPath);
                return await File.ReadAllBytesAsync(tempPngPath);
            }
            finally
            {
                if (File.Exists(tempPngPath)) File.Delete(tempPngPath);
            }
        }

        public async Task CloseAsync()
        {
            if (this._browser != null)
            {
                await this._browser.CloseAsync();
                this._browser = null;
            }
        }
    }
}
