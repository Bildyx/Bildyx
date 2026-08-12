import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuthNav } from "../hooks/useAuthNav";

type HeaderProps = {
  mode?: "default" | "company-admin";
  centerLabel?: string;
  backHref?: string;
  backLabel?: string;
  statusLabel?: string;
  /** Small text appended after the logo, e.g. "MicroResume" (see js/microresume.ts) */
  brandSuffix?: string;
  /** Extra nav rendered between the logo and the auth buttons, e.g. in-page anchor links */
  centerNav?: React.ReactNode;
  /** Replace the whole auth nav with a single account icon (see js/microresume-example.ts) */
  simpleAccountIcon?: boolean;
};

export default function Header({
  mode = "default",
  centerLabel = "",
  backHref = "",
  backLabel = "",
  statusLabel = "Unpublished",
  brandSuffix = "",
  centerNav,
  simpleAccountIcon = false,
}: HeaderProps) {
  const { isLoggedIn, isMenuOpen, setIsMenuOpen, signOut } = useAuthNav();
  const navigate = useNavigate();
  const isCompanyAdmin = mode === "company-admin";

  return (
    <header className={`site-header${isCompanyAdmin ? " site-header--company-admin" : ""}`}>
      <div className={`header-content${isCompanyAdmin ? " header-content--company-admin" : ""}`}>
        {isCompanyAdmin ? (
          <>
            <div className="company-admin-header-left">
              <Link to="/" className="logo" aria-label="Bildyx home">
                <img src="/images/Logo.png" alt="Bildyx" />
              </Link>

              {backHref !== "" && (
                <Link className="company-admin-preview-link" to={backHref}>
                  {backLabel || "‹ Preview company page"}
                </Link>
              )}
            </div>

            <div className="company-admin-header-title">{centerLabel || "F-CAREER"}</div>
          </>
        ) : (
          <Link to="/" className="logo" aria-label="Bildyx home">
            <img src="/images/Logo.png" alt="Bildyx" />
            {brandSuffix && <span className="mr-brand-suffix">{brandSuffix}</span>}
          </Link>
        )}

        {centerNav}

        {simpleAccountIcon ? (
          <nav className="nav-buttons" aria-label="Authentication and account">
            <Link className="mre-account-button" to="/coming-soon/account" aria-label="Account">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="8" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
                <path
                  d="M5.8 19c.6-3.2 2.8-5 6.2-5s5.6 1.8 6.2 5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </Link>
          </nav>
        ) : (
        <nav
          className={`nav-buttons${isCompanyAdmin ? " nav-buttons--company-admin is-authenticated" : ""}${
            !isCompanyAdmin && isLoggedIn ? " is-authenticated" : ""
          }`}
          aria-label="Authentication and account"
        >
          {isCompanyAdmin && (
            <>
              <button className="company-admin-status-pill" type="button">
                <span aria-hidden="true">◎</span>
                <span>{statusLabel}</span>
              </button>
              <button className="company-admin-header-icon" type="button" aria-label="Notifications">
                ♧
              </button>
              <button className="company-admin-header-icon" type="button" aria-label="Settings">
                ⚙
              </button>
            </>
          )}

          <NavLink to="/login" className="login">
            Log In
          </NavLink>
          <NavLink to="/login?tab=signup" className="signup">
            Sign Up
          </NavLink>

          <div className="account-menu">
            <button
              className="account-trigger"
              type="button"
              aria-label="Account menu"
              aria-expanded={isMenuOpen}
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
              }}
            >
              <span aria-hidden="true">𖡌</span>
            </button>

            <div className={`account-dropdown${isMenuOpen ? " is-open" : ""}`}>
              <Link to="/privacy-policy">
                <span aria-hidden="true">▱</span> Privacy
              </Link>
              <button type="button" onClick={() => signOut(navigate, "/login")}>
                <span aria-hidden="true">↪</span> Sign Out
              </button>
            </div>
          </div>
        </nav>
        )}
      </div>
    </header>
  );
}
