import { Link } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { usePageMeta } from "../../hooks/usePageMeta";

type Props = {
  name: string;
  originalFile: string;
};

/**
 * Temporary stand-in for pages not yet migrated from PHP.
 * Remove once the real React version of `originalFile` lands.
 */
export default function NotYetMigrated({ name, originalFile }: Props) {
  usePageMeta(`${name} — Bildyx`, `${name} is being migrated to React.`);

  return (
    <>
      <Header />

      <main className="generic-main">
        <section className="generic-card">
          <span className="eyebrow">Migration in progress</span>
          <h1>{name}</h1>
          <p>
            This page still lives in <code>{originalFile}</code> on the PHP site
            and hasn&apos;t been ported to React yet.
          </p>
          <Link to="/" className="primary-button">
            Back to home
          </Link>
        </section>
      </main>

      <Footer />
    </>
  );
}
