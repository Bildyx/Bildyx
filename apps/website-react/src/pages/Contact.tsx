import { FormEvent, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { usePageMeta } from "../hooks/usePageMeta";
import "../css/contact.css";

export default function Contact() {
  usePageMeta("Contact — Bildyx", "Contact Bildyx by email, phone, or message form.");

  const [status, setStatus] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // TODO: wire up to the real backend endpoint.
    setStatus("Message saved locally for now. Connect this form to your backend later.");
  }

  return (
    <>
      <Header />

      <main className="contact-main">
        <section className="contact-frame" aria-labelledby="contact-title">
          <div className="contact-inner">
            <header className="contact-heading">
              <h1 id="contact-title">Contact Us</h1>
              <p>We&apos;d love to hear from you. Please fill out this form or reach out via email.</p>
            </header>

            <div className="contact-grid">
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="contact-form-row">
                  <label>
                    <span>First Name</span>
                    <input type="text" name="first_name" placeholder="John" autoComplete="given-name" />
                  </label>

                  <label>
                    <span>Last Name</span>
                    <input type="text" name="last_name" placeholder="Doe" autoComplete="family-name" />
                  </label>
                </div>

                <label>
                  <span>Email Address</span>
                  <input type="email" name="email" placeholder="john.doe@example.com" autoComplete="email" />
                </label>

                <label>
                  <span>Subject</span>
                  <input type="text" name="subject" placeholder="How can we help you?" />
                </label>

                <label>
                  <span>Message</span>
                  <textarea name="message" placeholder="Write your message here..." />
                </label>

                <button type="submit">Send Message</button>
                <p className="contact-status" role="status" aria-live="polite">
                  {status}
                </p>
              </form>

              <aside className="contact-info-card" aria-label="Contact information">
                <article className="contact-info-item">
                  <img src="/images/contact-email.png" alt="" aria-hidden="true" />
                  <div>
                    <h2>Email Us</h2>
                    <p>
                      <a href="mailto:benjamin@bildyx.com">benjamin@bildyx.com</a>
                    </p>
                  </div>
                </article>

                <article className="contact-info-item">
                  <img src="/images/contact-location.png" alt="" aria-hidden="true" />
                  <div>
                    <h2>Office Location</h2>
                    <p>
                      Tokyo Innovation Base
                      <br />
                      SusHi Tech Square 3F, 3-8-3
                      <br />
                      Marunouchi, Chiyoda-ku,
                      <br />
                      〒100-0005 Tokyo
                    </p>
                  </div>
                </article>

                <article className="contact-info-item">
                  <img src="/images/contact-phone.png" alt="" aria-hidden="true" />
                  <div>
                    <h2>Phone</h2>
                    <p>
                      <a href="tel:+8108067382406">+81 (0)80-6738-2406</a>
                      <br />
                      Mon-Fri, 9am - 6pm UTC+9
                    </p>
                  </div>
                </article>
              </aside>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
