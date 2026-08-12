import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { usePageMeta } from "../hooks/usePageMeta";
import "../css/company_con.css";

export default function CompanyArchiveTrue() {
  usePageMeta("Company Archives — Bildyx", "Connected company archives.");

  return (
    <>
      <Header />

      <main className="cc-page">
        <div className="cc-company-bar">
          <span>Company Archives</span>
          <Link className="cc-edit-link" to="/company-admin">
            ‹ Back
          </Link>
        </div>

        <section className="cc-archive">
          <h1>Company Archives</h1>
          <p>This page is connected to the same company account.</p>
          <div className="cc-slot-grid">
            <div className="cc-large-slot" />
            <div className="cc-large-slot" />
            <div className="cc-large-slot" />
            <div className="cc-large-slot" />
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
