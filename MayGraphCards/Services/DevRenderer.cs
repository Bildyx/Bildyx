using PuppeteerSharp;

namespace MayGraphCards.Services
{
    public class DevRenderer
    {
        private readonly ImageRenderer _imageRenderer;

        public DevRenderer(String? browserPath = null)
        {
            _imageRenderer = new ImageRenderer(browserPath);
        }

        public async Task ShowHtmlAsync(String html, Int32 width, String? mockupImagePath = null)
        {
            await _imageRenderer.InitialisationAsync();

            // Add the reference image with transparency
            if (!string.IsNullOrWhiteSpace(mockupImagePath))
            {
                String overlayImg = $@"
                    <img src='{mockupImagePath}' 
                         style='
                            position:absolute;
                            top:0;
                            left:0;
                            width:{width}px;
                            height:auto;
                            opacity:0.3;
                            z-index:0;
                            pointer-events:none;' />";

                html = html.Replace("</body>", $"{overlayImg}</body>");
            }

            // Write the HTML to a temporary file
            String tempHtmlPath = Path.Combine(Path.GetTempPath(), $"dev_{Guid.NewGuid()}.html");
            await File.WriteAllTextAsync(tempHtmlPath, html);
            String htmlUri = new Uri(tempHtmlPath).AbsoluteUri;

            // Launch Chromium
            LaunchOptions options = _imageRenderer.LaunchOptions!;
            options.Headless = false;
            options.Devtools = true;
            IBrowser browser = await Puppeteer.LaunchAsync(options);
            IPage page = await browser.NewPageAsync();
            await page.GoToAsync(htmlUri, WaitUntilNavigation.Networkidle0);
            Console.WriteLine("Test window opened. Close it manually to finish");
        }
    }
}