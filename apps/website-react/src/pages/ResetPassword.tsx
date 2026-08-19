import { FormEvent, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import AuthLayout from "../components/AuthLayout";
import FormField from "../components/FormField";
import CaptchaBox from "../components/CaptchaBox";
import { usePageMeta } from "../hooks/usePageMeta";
import { useCaptcha } from "../hooks/useCaptcha";
import { extractErrorMessage } from "../lib/formHelpers";
import { toast } from "../lib/toast";
import { AuthService } from "../services/auth.service";

const authService = new AuthService();

export default function ResetPassword() {
  usePageMeta("Bildyx — Reset Password", "Choose a new Bildyx password.");

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const captcha = useCaptcha();
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    let ok = true;

    if (password.length < 8) {
      setPasswordError("Password must contain at least 8 characters.");
      ok = false;
    } else {
      setPasswordError("");
    }

    if (confirmPassword !== password) {
      setConfirmError("Passwords do not match.");
      ok = false;
    } else {
      setConfirmError("");
    }

    if (!captcha.verify()) ok = false;
    if (!ok) return;

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
        <form ref={formRef} className="auth-form active" noValidate onSubmit={handleSubmit}>
          <div className="form-heading center">
            <h2>Reset your password</h2>
            <p>Choose a new password for your account.</p>
          </div>

          <FormField
            id="resetPassword"
            label="New Password"
            type="password"
            placeholder="••••••••"
            minLength={8}
            maxLength={72}
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={passwordError}
            icon="/images/image.png"
            showPasswordToggle={true}
          />

          <FormField
            id="confirmPassword"
            label="Confirm Password"
            type="password"
            placeholder="Repeat password"
            maxLength={72}
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={confirmError}
            icon="/images/image.png"
          />

          <CaptchaBox captcha={captcha} />

          <button className="submit-btn" type="submit" disabled={isLoading}>
            {isLoading ? "..." : "Update Password"}
          </button>

          <p className="switch-text">
            Back to <Link className="link-btn" to="/login">Log in</Link>
          </p>
        </form>
      </AuthLayout>

      <Footer />
    </>
  );
}
