import { Link, useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { usePageMeta } from "../hooks/usePageMeta";

const pages: Record<string, string> = {
  login: "Log In",
  signup: "Sign Up",
  "create-team-profile": "Create Team Profile",
  "create-microresume": "Create MicroResume",
  company: "Company",
  mission: "Mission",
  contact: "Contact",
  "why-we-built-it": "Why we built it",
  linkedin: "LinkedIn",
  facebook: "Facebook",
  youtube: "YouTube",
  "x-twitter": "X / Twitter",
  instagram: "Instagram",
  "privacy-policy": "Privacy Policy",
  "terms-of-service": "Terms of Service",
};

export default function Generic() {
  const { page } = useParams<{ page: string }>();
  const featureName = (page && pages[page]) || "This feature";

  usePageMeta(`Bildyx — ${featureName}`, `${featureName} is coming soon on Bildyx.`);

  return (
    <>
      <Header />

      <main className="generic-main">
        <section className="generic-card">
          <span className="eyebrow">Coming soon</span>
          <h1>{featureName}</h1>
          <p>This page is under construction. The feature will be added later.</p>
          <Link to="/" className="primary-button">
            Back to home
          </Link>
        </section>
      </main>

      <Footer />
    </>
  );
}
