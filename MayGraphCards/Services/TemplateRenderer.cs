using RazorLight;

namespace MayGraphCards.Services
{
    public class TemplateRenderer
    {
        private readonly RazorLightEngine _engine;

        public TemplateRenderer()
        {
            // AppContext.BaseDirectory (build output) is more reliable than Directory.GetCurrentDirectory(),
            // which changes depending on how the process was launched (dotnet run, orphan .bat, etc.).
            _engine = new RazorLightEngineBuilder()
                .UseFileSystemProject(AppContext.BaseDirectory)
                .UseMemoryCachingProvider()
                .Build();
        }

        public async Task<String> RenderTemplateAsync<T>(String templatePath, T model)
        {
            String absoluteTemplatePath = Path.GetFullPath(templatePath);
            String templateKey = absoluteTemplatePath;
            String templateContent = await File.ReadAllTextAsync(absoluteTemplatePath);
            return await _engine.CompileRenderStringAsync<T>(templateKey, templateContent, model);
        }
    }
}
