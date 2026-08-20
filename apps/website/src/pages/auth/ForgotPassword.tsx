import { FormEvent, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import AuthLayout from "../../components/auth/AuthLayout";
import FormInput from "../../components/forms/FormInput";
import CaptchaBox from "../../components/auth/CaptchaBox";
import { usePageMeta } from "../../hooks/usePageMeta";
import { useCaptcha } from "../../hooks/useCaptcha";
import { extractErrorMessage } from "../../lib/formHelpers";
import { toast } from "../../lib/toast";
import { AuthService } from "../../services/auth.service";
import { useFormValidation } from "../../hooks/useFormValidation";
import ValidatedForm from "../../components/forms/ValidatedForm";
import { ForgotPasswordInputSchema } from "@repo/models/auth";

const authService = new AuthService();

export default function ForgotPassword() {
  usePageMeta("Bildyx — Forgot Password", "Reset your Bildyx password.");

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const captcha = useCaptcha();
  const formRef = useRef<HTMLFormElement>(null);

  const { errors, validateForm, setErrors } = useFormValidation(
    ForgotPasswordInputSchema,
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const isFormValid = validateForm({ email: email.trim() });
    const isCaptchaValid = captcha.verify();

    if (!isFormValid || !isCaptchaValid) {
      captcha.refresh();
      return;
    }

    setIsLoading(true);
    try {
      await authService.forgotPassword({ email: email.trim() });
      toast.success(
        "If an account exists, a reset link has been sent. Check your email.",
      );
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
        <ValidatedForm
          ref={formRef}
          className="auth-form active"
          errors={errors}
          setErrors={setErrors}
          noValidate
          onSubmit={handleSubmit}
        >
          <div className="form-heading center">
            <h2>Forgot your password?</h2>
            <p>Enter your email address and we will send you a reset link.</p>
          </div>

          <FormInput
            id="forgotEmail"
            name="email"
            label="Email"
            type="email"
            placeholder="you@example.com"
            maxLength={120}
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            icon="/images/image.png"
          />

          <CaptchaBox captcha={captcha} />

          <button className="submit-btn" type="submit" disabled={isLoading}>
            {isLoading ? "..." : "Send reset link"}
          </button>

          <p className="switch-text">
            Remember your password?{" "}
            <Link className="link-btn" to="/login">
              Log in
            </Link>
          </p>
        </ValidatedForm>
      </AuthLayout>

      <Footer />
    </>
  );
}
