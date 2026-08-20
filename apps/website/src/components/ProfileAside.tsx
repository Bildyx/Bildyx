import { Link } from "react-router-dom";

type ProfileAsideProps = {
  activePage: "profile" | "target-list" | "tests-preferences" | "my-jobs" | "settings";
};

export default function ProfileAside({ activePage }: ProfileAsideProps) {
  return (
    <aside className="profile-side-nav" aria-label="Profile menu">
      <Link
        className={`side-nav-button${activePage === "profile" ? " is-active" : ""}`}
        to="/profile"
      >
        <span aria-hidden="true">
          <i className="bi bi-person-fill"></i>
        </span>
        Profile
      </Link>

      <Link
        className={`side-nav-button${activePage === "target-list" ? " is-active" : ""}`}
        to="/target-list"
      >
        <span aria-hidden="true">
          <i className="bi bi-bullseye"></i>
        </span>
        My Target List
      </Link>

      <Link
        className={`side-nav-button${activePage === "tests-preferences" ? " is-active" : ""}`}
        to="/tests-preferences"
      >
        <span aria-hidden="true">
          <i className="bi bi-clipboard2-check-fill"></i>
        </span>
        Tests &amp;
        <br /> Preferences
      </Link>

      <Link
        className={`side-nav-button${activePage === "my-jobs" ? " is-active" : ""}`}
        to="/my-jobs"
      >
        <span aria-hidden="true">
          <i className="bi bi-briefcase-fill"></i>
        </span>
        My Jobs
      </Link>

      <Link
        className={`side-nav-button${activePage === "settings" ? " is-active" : ""}`}
        to="/coming-soon/settings"
      >
        <span aria-hidden="true">
          <i className="bi bi-gear-fill"></i>
        </span>
        Settings
      </Link>
    </aside>
  );
}
