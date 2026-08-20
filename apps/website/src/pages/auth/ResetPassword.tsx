import { FormEvent, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
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
import { ResetPasswordInputSchema } from "@repo/models/auth";
import { z } from "zod";

const authService = new AuthService();

const resetSchema = ResetPasswordInputSchema.extend({
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

export default function ResetPassword() {
  usePageMeta("Bildyx — Reset Password", "Choose a new Bildyx password.");

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const captcha = useCaptcha();
  const formRef = useRef<HTMLFormElement>(null);

  const { errors, validateForm, setErrors } = useFormValidation(resetSchema);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const isFormValid = validateForm({
      email,
      token,
      password,
      confirmPassword,
    });
    const isCaptchaValid = captcha.verify();

    if (!isFormValid || !isCaptchaValid) {
      captcha.refresh();
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword({ email, token, password });
      toast.success("Password updated successfully. You can now log in.");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Unable to reset password"));
    } finally {
      setIsLoading(false);
    }

    captcha.refresh();
    setPassword("");
    setConfirmPassword("");
    formRef.current?.reset();
  }

  return (
    <>
      <Header />

      <AuthLayout formLabel="Reset password form">
        <ValidatedForm
          ref={formRef}
          className="auth-form active"
          errors={errors}
          setErrors={setErrors}
          noValidate
          onSubmit={handleSubmit}
        >
          <div className="form-heading center">
            <h2>Reset your password</h2>
            <p>Choose a new password for your account.</p>
          </div>

          <FormInput
            id="resetPassword"
            name="password"
            label="New Password"
            type="password"
            placeholder="••••••••"
            minLength={8}
            maxLength={72}
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            icon="/images/image.png"
            showPasswordToggle={true}
          />

          <FormInput
            id="confirmPassword"
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            placeholder="Repeat password"
            maxLength={72}
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={errors.confirmPassword}
            icon="/images/image.png"
          />

          <CaptchaBox captcha={captcha} />

          <button className="submit-btn" type="submit" disabled={isLoading}>
            {isLoading ? "..." : "Update Password"}
          </button>

          <p className="switch-text">
            Back to{" "}
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
