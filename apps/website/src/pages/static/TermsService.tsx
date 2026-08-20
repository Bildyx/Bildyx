import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { usePageMeta } from "../../hooks/usePageMeta";
import "../../css/terms-service.css";

export default function TermsService() {
  usePageMeta("Terms of Service — Bildyx", "Bildyx Terms of Service.");

  return (
    <>
      <Header />

      <main className="terms-main">
        <article className="terms-frame" aria-labelledby="terms-title">
          <div className="terms-inner">
            <header className="terms-header">
              <h1 id="terms-title">Terms of Service</h1>
              <p>Last Updated: October 2026</p>
            </header>

            <section className="terms-section">
              <h2>1. Acceptance of Terms</h2>
              <p>
                By accessing or using Bildyx and our services, including
                creating a Company Profile or a Job Seeker Microresume, you
                agree to be bound by these Terms of Service. If you do not agree
                to these terms, please do not use our services.
              </p>
            </section>

            <section className="terms-section">
              <h2>2. Account Creation and Responsibilities</h2>
              <p>
                When you create an account, whether as a Company or a Job
                Seeker, you must provide accurate, current, and complete
                information. You are solely responsible for maintaining the
                confidentiality of your account and password.
              </p>
              <ul>
                <li>
                  <strong>Company Accounts:</strong> You must have the authority
                  to bind your organization to these Terms. You are responsible
                  for all team profiles, content, and job listings posted under
                  your account.
                </li>
                <li>
                  <strong>Job Seeker Accounts:</strong> You agree that your
                  microresume and any provided data are accurate and reflect
                  your true professional experience and skills.
                </li>
              </ul>
            </section>

            <section className="terms-section">
              <h2>3. User Content and Conduct</h2>
              <p>
                You retain ownership of any content you submit, post, or display
                on or through Bildyx. By submitting content, you grant us a
                worldwide, non-exclusive, royalty-free license to use,
                reproduce, adapt, and publish such content solely for the
                purpose of providing and improving our services.
              </p>
              <p>
                You agree not to post any content that is defamatory,
                fraudulent, discriminatory, or otherwise violates the rights of
                others or applicable laws.
              </p>
            </section>

            <section className="terms-section">
              <h2>4. Platform Use Restrictions</h2>
              <p>You agree not to use Bildyx to:</p>
              <ul>
                <li>
                  Scrape, datamine, or harvest user data or company profiles.
                </li>
                <li>
                  Distribute spam, malicious code, or unauthorized promotional
                  material.
                </li>
                <li>
                  Impersonate any person or entity, or falsely state your
                  affiliation with a person or entity.
                </li>
              </ul>
            </section>

            <section className="terms-section">
              <h2>5. Termination</h2>
              <p>
                We reserve the right to suspend or terminate your account and
                access to the services at our sole discretion, without notice or
                liability, for any reason, including a breach of these Terms of
                Service.
              </p>
            </section>

            <section className="terms-section">
              <h2>6. Limitation of Liability</h2>
              <p>
                To the fullest extent permitted by law, Bildyx shall not be
                liable for any indirect, incidental, special, consequential, or
                punitive damages, or any loss of profits or revenues, whether
                incurred directly or indirectly, or any loss of data, use,
                goodwill, or other intangible losses resulting from your use of
                the platform.
              </p>
            </section>

            <section className="terms-section">
              <h2>7. Changes to Terms</h2>
              <p>
                We may modify these Terms at any time. If we make material
                changes, we will notify you by email or by posting a notice on
                our platform. Your continued use of the services after the
                changes become effective constitutes your acceptance of the new
                Terms.
              </p>
            </section>

            <section className="terms-section">
              <h2>8. Contact Us</h2>
              <p>
                If you have any questions or concerns about these Terms, please
                contact us at{" "}
                <a href="mailto:legal@bildyx.com">legal@bildyx.com</a>.
              </p>
            </section>
          </div>
        </article>
      </main>

      <Footer />
    </>
  );
}
