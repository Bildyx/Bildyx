import { FormEvent, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import AuthLayout from "../components/AuthLayout";
import FormField from "../components/FormField";
import CaptchaBox from "../components/CaptchaBox";
import { usePageMeta } from "../hooks/usePageMeta";
import { useCaptcha } from "../hooks/useCaptcha";
import { validEmail, extractErrorMessage } from "../lib/formHelpers";
import { toast } from "../lib/toast";
import { AuthService } from "../services/auth.service";

const authService = new AuthService();

export default function ForgotPassword() {
  usePageMeta("Bildyx — Forgot Password", "Reset your Bildyx password.");

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const captcha = useCaptcha();
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    let ok = true;

    if (!validEmail(email.trim())) {
      setEmailError("Enter a valid email.");
      ok = false;
    } else {
      setEmailError("");
    }

    if (!captcha.verify()) ok = false;
    if (!ok) return;

    setIsLoading(true);
    try {
      await authService.forgotPassword({ email: email.trim() });
      toast.success("If an account exists, a reset link has been sent. Check your email.");
    } catch (err) {
      toast.error(extractErrorMessage(err, "Unable to send reset email"));
    } finally {
      setIsLoading(false);
    }

    captcha.refresh();
    setEmail("");
    formRef.current?.reset();
  }

  return (
    <>
      <Header />

      <AuthLayout formLabel="Forgot password form">
        <form ref={formRef} className="auth-form active" noValidate onSubmit={handleSubmit}>
          <div className="form-heading center">
            <h2>Forgot your password?</h2>
            <p>Enter your email address and we will send you a reset link.</p>
          </div>

          <FormField
            id="forgotEmail"
            label="Email"
            type="email"
            placeholder="you@example.com"
            maxLength={120}
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={emailError}
            icon="/images/image.png"
          />

          <CaptchaBox captcha={captcha} />

          <button className="submit-btn" type="submit" disabled={isLoading}>
            {isLoading ? "..." : "Send reset link"}
          </button>

          <p className="switch-text">
            Remember your password? <Link className="link-btn" to="/login">Log in</Link>
          </p>
        </form>
      </AuthLayout>

      <Footer />
    </>
  );
}
