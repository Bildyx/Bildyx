import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuthNav } from "../hooks/useAuthNav";
import { getSession } from "../lib/session";
import { OrganizationService } from "../services/organization.service";

const organizationService = new OrganizationService();

type HeaderProps = {
  isAdmin?: boolean;
  centerLabel?: string;
  backHref?: string;
  backLabel?: string;
  statusLabel?: string;
  brandSuffix?: string;
  centerNav?: React.ReactNode;
  simpleAccountIcon?: boolean;
};

export default function Header({
  isAdmin = false,
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

  const session = getSession();

  const [isCompany, setIsCompany] = useState(
    !!session?.organizationId || !!session?.companyId,
  );
  const [redirectPath, setRedirectPath] = useState("/profile");

  useEffect(() => {
    const orgId = session?.organizationId || session?.companyId;
    if (!orgId) return;
    setIsCompany(true);
    organizationService
      .getById(orgId as string)
      .then((org) => {
        if (org?.profile_url) {
          setRedirectPath(`/${org.profile_url}/admin`);
        }
      })
      .catch((err) => console.error("Failed to fetch organization", err));
  }, []);

  return (
    <header
      className={`site-header${isAdmin ? " site-header--company-admin" : ""}`}
    >
      <div
        className={`header-content${isAdmin ? " header-content--company-admin" : ""}`}
      >
        {isAdmin ? (
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

            <div className="company-admin-header-title">
              {centerLabel || "F-CAREER"}
            </div>
          </>
        ) : (
          <Link to="/" className="logo" aria-label="Bildyx home">
            <img src="/images/Logo.png" alt="Bildyx" />
            {brandSuffix && (
              <span className="mr-brand-suffix">{brandSuffix}</span>
            )}
          </Link>
        )}

        {centerNav}

        {simpleAccountIcon ? (
          <nav className="nav-buttons" aria-label="Authentication and account">
            <Link
              className="mre-account-button"
              to="/coming-soon/account"
              aria-label="Account"
            >
              <i className="bi bi-person-fill" aria-hidden="true"></i>
            </Link>
          </nav>
        ) : (
          <nav
            className={`nav-buttons${isAdmin ? " nav-buttons--company-admin is-authenticated" : ""}${
              !isAdmin && isLoggedIn ? " is-authenticated" : ""
            }`}
            aria-label="Authentication and account"
          >
            {isAdmin && (
              <>
                <button className="company-admin-status-pill" type="button">
                  <i className="bi bi-circle" aria-hidden="true"></i>
                  <span>{statusLabel}</span>
                </button>
                <button
                  className="company-admin-header-icon"
                  type="button"
                  aria-label="Notifications"
                >
                  <i className="bi bi-bell"></i>
                </button>
                <button
                  className="company-admin-header-icon"
                  type="button"
                  aria-label="Settings"
                >
                  <i className="bi bi-gear"></i>
                </button>
              </>
            )}

            <NavLink to="/login" className="login">
              Log In
            </NavLink>
            <NavLink to="/login?tab=signup" className="signup">
              Sign Up
            </NavLink>

            <div className={`account-menu${isMenuOpen ? " is-open" : ""}`}>
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
                <i className="bi bi-person-fill" aria-hidden="true"></i>
              </button>

              <div
                className={`account-dropdown${isMenuOpen ? " is-open" : ""}`}
              >
                <Link to={redirectPath}>
                  <i className="bi bi-person" aria-hidden="true"></i> My Profile
                </Link>

                <Link to="/privacy-policy">
                  <i className="bi bi-shield-lock" aria-hidden="true"></i>{" "}
                  Privacy
                </Link>
                <button
                  type="button"
                  onClick={() => signOut(navigate, "/login")}
                >
                  <i className="bi bi-box-arrow-right" aria-hidden="true"></i>{" "}
                  Sign Out
                </button>
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
