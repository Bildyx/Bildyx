import { Link } from "react-router-dom";

type FooterProps = {
  /** Small text appended after the footer logo, e.g. "MicroResume" (see js/microresume.ts) */
  brandSuffix?: string;
};

export default function Footer({ brandSuffix = "" }: FooterProps) {
  return (
    <footer className="site-footer">
      <div className="footer-content">
        <div className="footer-brand">
          <Link to="/" className="footer-logo" aria-label="Bildyx home">
            <img src="/images/Logo.png" alt="Bildyx" />
            {brandSuffix && <span className="mr-footer-brand-suffix">{brandSuffix}</span>}
          </Link>
          <p>A structured, modular visibility layer for modern hiring.</p>
        </div>

        <div className="footer-column">
          <h2>About us</h2>
          <Link to="/company">Company</Link>
          <Link to="/mission">Mission</Link>
          <Link to="/contact">Contact</Link>
        </div>

        <div className="footer-column">
          <h2>Our story</h2>
          <Link to="/why-built-it">Why we built it</Link>
        </div>

        <div className="footer-column">
          <h2>Social media</h2>
          <Link to="/coming-soon/linkedin">LinkedIn</Link>
          <Link to="/coming-soon/facebook">Facebook</Link>
          <Link to="/coming-soon/youtube">Youtube</Link>
          <Link to="/coming-soon/x-twitter">X / Twitter</Link>
          <Link to="/coming-soon/instagram">Instagram</Link>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 MayGraph. All rights reserved.</p>
        <div className="footer-legal">
          <Link to="/privacy-policy">Privacy Policy</Link>
          <Link to="/terms-service">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}
