namespace BildixApi.Services;

// Transactional email abstraction (Phase 7.2). Swap LoggingEmailService for a
// real provider (Resend/Brevo/SendGrid) by implementing this and registering it.
public interface IEmailService
{
    Task SendAsync(string to, string subject, string htmlBody);
}

// Default implementation: logs the email instead of sending it. Lets the
// notification flow run end-to-end with no external account configured.
public class LoggingEmailService(ILogger<LoggingEmailService> logger) : IEmailService
{
    public Task SendAsync(string to, string subject, string htmlBody)
    {
        logger.LogInformation("[email] to={To} subject={Subject}", to, subject);
        return Task.CompletedTask;
    }
}
