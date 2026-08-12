import { Link } from "react-router-dom";
import "../css/auth.css";

type AuthLayoutProps = {
  children: React.ReactNode;
  formLabel: string;
};

/**
 * Ported from the repeated markup in forgot-password.php / reset-password.php /
 * verify-email.php (`<section class="brand-panel">` + `<section class="form-panel">`).
 */
export default function AuthLayout({ children, formLabel }: AuthLayoutProps) {
  return (
    <main className="auth-shell">
      <section className="brand-panel" aria-label="Bildyx presentation">
        <Link className="brand" to="/" aria-label="Back to home">
          <img className="brand-icon" src="/images/bildyx-icon.png" alt="" />
          <span>BILDYX</span>
        </Link>

        <div className="brand-content">
          <h1>
            &quot;Right Teams. Right
            <br />
            Candidates.&quot;
          </h1>
          <div className="brand-features">
            <article className="feature-card brand-feature">
              <span className="feature-icon">
                <img src="/images/image.png" alt="" />
              </span>
              <div>
                <h2 className="brand-feature-title">For Companies</h2>
                <p className="brand-feature-text">Build profile and present your teams to potential candidates.</p>
              </div>
            </article>
            <article className="feature-card brand-feature">
              <span className="feature-icon">
                <img src="/images/image.png" alt="" />
              </span>
              <div>
                <h2 className="brand-feature-title">For Job Seekers</h2>
                <p className="brand-feature-text">
                  Create a powerful microresume in minutes. Use Microresume as elevator pitch to potential employers.
                </p>
              </div>
            </article>
          </div>
        </div>

        <p className="copyright">© 2026 MayGraph.com. All rights reserved.</p>
      </section>

      <section className="form-panel" aria-label={formLabel}>
        <div className="auth-card">{children}</div>
      </section>
    </main>
  );
}
