import { FormEvent, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import AuthLayout from "../components/AuthLayout";
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
  const [showPassword, setShowPassword] = useState(false);
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

          <div className="field">
            <label htmlFor="resetPassword">New Password</label>
            <div className={`input-wrap${passwordError ? " invalid" : ""}`}>
              <img className="input-icon" src="/images/image.png" alt="" />
              <input
                id="resetPassword"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                minLength={8}
                maxLength={72}
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                className="icon-btn toggle-password"
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((v) => !v)}
              >
                <img className="eye-icon" src="/images/image.png" alt="" />
              </button>
            </div>
            <small className="error">{passwordError}</small>
          </div>

          <div className="field">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className={`input-wrap${confirmError ? " invalid" : ""}`}>
              <img className="input-icon" src="/images/image.png" alt="" />
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Repeat password"
                maxLength={72}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <small className="error">{confirmError}</small>
          </div>

          <div className="captcha-box">
            <div>
              <strong>Security check</strong>
              <p>
                Solve this quick captcha: <span className="captcha-question">{captcha.question}</span>
              </p>
            </div>
            <button className="captcha-refresh" type="button" aria-label="Refresh captcha" onClick={captcha.refresh}>
              Refresh
            </button>
            <input
              className="captcha-answer"
              type="number"
              inputMode="numeric"
              placeholder="Answer"
              required
              value={captcha.value}
              onChange={(e) => captcha.setValue(e.target.value)}
            />
          </div>
          <small className="captcha-error error">{captcha.error}</small>

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
