import { FormEvent } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { usePageMeta } from "../../hooks/usePageMeta";
import "../../css/contact.css";
import { ContactRequestService } from "../../services/contact_requests.service";
import { toast } from "../../lib/toast";
import FormInput from "../../components/forms/FormInput";
import { useFormValidation } from "../../hooks/useFormValidation";
import ValidatedForm from "../../components/forms/ValidatedForm";
import { PostContactRequestSchema } from "@repo/models/contact_requests";

const contactRequestService = new ContactRequestService();

export default function Contact() {
  usePageMeta(
    "Contact — Bildyx",
    "Contact Bildyx by email, phone, or message form.",
  );

  const { errors, validateForm, setErrors } = useFormValidation(
    PostContactRequestSchema,
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;

    if (!validateForm(form)) return;

    try {
      await contactRequestService.create({
        firstname: form.firstname.value.trim(),
        lastname: form.lastname.value.trim(),
        email: form.email.value.trim(),
        subject: form.subject.value.trim(),
        message: form.message.value.trim(),
      });
      toast.success("Message sent successfully!");
      form.reset();
    } catch (err) {
      toast.error("Failed to send message");
    }
  }

  return (
    <>
      <Header />

      <main className="contact-main">
        <section className="contact-frame" aria-labelledby="contact-title">
          <div className="contact-inner">
            <header className="contact-heading">
              <h1 id="contact-title">Contact Us</h1>
              <p>
                We&apos;d love to hear from you. Please fill out this form or
                reach out via email.
              </p>
            </header>

            <div className="contact-grid">
              <ValidatedForm
                className="contact-form"
                errors={errors}
                setErrors={setErrors}
                onSubmit={handleSubmit}
                noValidate
              >
                <div className="contact-form-row">
                  <FormInput
                    label="First Name"
                    name="firstname"
                    placeholder="John"
                    autoComplete="given-name"
                    required
                    error={errors.firstname}
                  />

                  <FormInput
                    label="Last Name"
                    name="lastname"
                    placeholder="Doe"
                    autoComplete="family-name"
                    required
                    error={errors.lastname}
                  />
                </div>

                <FormInput
                  label="Email Address"
                  type="email"
                  name="email"
                  placeholder="john.doe@example.com"
                  autoComplete="email"
                  required
                  error={errors.email}
                />

                <FormInput
                  label="Subject"
                  name="subject"
                  placeholder="How can we help you?"
                  required
                  error={errors.subject}
                />

                <FormInput
                  label="Message"
                  name="message"
                  placeholder="Write your message here..."
                  required
                  error={errors.message}
                />

                <button type="submit">Send Message</button>
              </ValidatedForm>

              <aside
                className="contact-info-card"
                aria-label="Contact information"
              >
                <article className="contact-info-item">
                  <img
                    src="/images/contact-email.png"
                    alt=""
                    aria-hidden="true"
                  />
                  <div>
                    <h2>Email Us</h2>
                    <p>
                      <a href="mailto:benjamin@bildyx.com">
                        benjamin@bildyx.com
                      </a>
                    </p>
                  </div>
                </article>

                <article className="contact-info-item">
                  <img
                    src="/images/contact-location.png"
                    alt=""
                    aria-hidden="true"
                  />
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
                  <img
                    src="/images/contact-phone.png"
                    alt=""
                    aria-hidden="true"
                  />
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
