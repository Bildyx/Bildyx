import { FormEvent, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import AuthLayout from "../components/AuthLayout";
import { usePageMeta } from "../hooks/usePageMeta";
import { useCaptcha } from "../hooks/useCaptcha";
import {
  extractErrorMessage,
  passwordScore,
  validEmail,
} from "../lib/formHelpers";
import { toast } from "../lib/toast";
import {
  addAttempt,
  getAuthUser,
  getRedirectPath,
  saveBildyxSession,
  savePendingAccountType,
  tooManyAttempts,
} from "../lib/authSession";
import { AuthService, type SignupInput } from "../services/auth.service";
import { User } from "@repo/models/users";

const authService = new AuthService();

type AccountType = "company" | "seeker";
type FieldErrors = Record<string, string>;

export default function Login() {
  usePageMeta("Bildyx — Login / Sign Up", "Log in or create a Bildyx account.");

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialTab = searchParams.get("tab") === "signup" ? "signup" : "login";
  const [activeTab, setActiveTab] = useState<"login" | "signup">(initialTab);

  // ─── Signup form state ──────────────────────────────────────
  const [accountType, setAccountType] = useState<AccountType>("company");
  const [companyName, setCompanyName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [terms, setTerms] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [signupErrors, setSignupErrors] = useState<FieldErrors>({});
  const [isSigningUp, setIsSigningUp] = useState(false);
  const signupCaptcha = useCaptcha();

  // ─── Login form state ───────────────────────────────────────
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginErrors, setLoginErrors] = useState<FieldErrors>({});
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const loginCaptcha = useCaptcha();

  async function handleSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    let ok = true;

    if (!signupCaptcha.verify()) {
      toast.warning("Please enter the captcha.");
      ok = false;
    }
    if (!terms) {
      toast.warning("Please accept the Terms and Privacy Policy.");
      ok = false;
    }
    if (!ok) return;

    const body: SignupInput = {
      accountType,
      email: signupEmail.trim(),
      password: signupPassword.trim(),
      marketing,
    };
    if (accountType === "company") body.companyName = companyName.trim();
    else {
      body.firstName = firstName.trim();
      body.lastName = lastName.trim();
    }

    setIsSigningUp(true);
    setSignupErrors({});
    try {
      const data = await authService.signup(body);
      savePendingAccountType(accountType, data.userId);
      navigate(`/verify-email?userId=${encodeURIComponent(data.userId)}`);
    } catch (err) {
      let errorData:
        | {
            data?: { issues?: { path: string[]; message: string }[] };
            message?: string;
          }
        | undefined;
      if (err instanceof Error) {
        try {
          errorData = JSON.parse(err.message);
        } catch {
          // not JSON, fall through
        }
      }

      if (errorData?.data?.issues) {
        const fieldErrors: FieldErrors = {};
        errorData.data.issues.forEach((issue) => {
          fieldErrors[issue.path[0]] = issue.message;
        });
        setSignupErrors(fieldErrors);
        toast.error("Please fix the errors in the form.");
      } else {
        toast.error(extractErrorMessage(err, "Sign up failed."));
      }
    } finally {
      setIsSigningUp(false);
    }
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    let ok = true;
    const email = loginEmail.trim();
    const errors: FieldErrors = {};

    if (!validEmail(email)) {
      errors.email = "Enter a valid email.";
      ok = false;
    }
    if (loginPassword.length === 0) {
      errors.password = "Password is required.";
      ok = false;
    }
    setLoginErrors(errors);

    if (!loginCaptcha.verify()) ok = false;
    if (!ok) return;

    if (tooManyAttempts(email)) {
      toast.warning("Too many login attempts. Try again later.");
      return;
    }

    setIsLoggingIn(true);
    try {
      const data = await authService.login({ email, password: loginPassword });
      const user: User = getAuthUser(data);
      saveBildyxSession(user, email);
      const redirectPath = await getRedirectPath(user);
      navigate(redirectPath);
    } catch (err) {
      addAttempt(email);
      toast.error(extractErrorMessage(err, "Invalid credentials"));
    } finally {
      setIsLoggingIn(false);
    }
  }

  function handleGoogleSignup() {
    const width = 520;
    const height = 650;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    window.open(
      `${process.env.API_URL}/api/auth/google`,
      "GoogleLogin",
      `width=${width},height=${height},left=${left},top=${top},popup=yes,menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes`,
    );
  }

  return (
    <>
      <Header />

      <AuthLayout formLabel="Authentication forms">
        <div className="tabs" role="tablist" aria-label="Authentication tabs">
          <button
            className={`tab${activeTab === "signup" ? " active" : ""}`}
            type="button"
            role="tab"
            aria-selected={activeTab === "signup"}
            onClick={() => setActiveTab("signup")}
          >
            Sign Up
          </button>
          <button
            className={`tab${activeTab === "login" ? " active" : ""}`}
            type="button"
            role="tab"
            aria-selected={activeTab === "login"}
            onClick={() => setActiveTab("login")}
          >
            Log In
          </button>
        </div>

        <form
          className={`auth-form${activeTab === "signup" ? " active" : ""}`}
          noValidate
          onSubmit={handleSignup}
        >
          <div className="form-heading">
            <h2>Create an account</h2>
            <p>Select your account type to get started.</p>
          </div>

          <div
            className="account-switch"
            role="radiogroup"
            aria-label="Account type"
          >
            <label
              className={`account-option${accountType === "company" ? " active" : ""}`}
            >
              <input
                type="radio"
                name="accountType"
                value="company"
                checked={accountType === "company"}
                onChange={() => setAccountType("company")}
              />
              <span>Company</span>
            </label>
            <label
              className={`account-option${accountType === "seeker" ? " active" : ""}`}
            >
              <input
                type="radio"
                name="accountType"
                value="seeker"
                checked={accountType === "seeker"}
                onChange={() => setAccountType("seeker")}
              />
              <span>Job Seeker</span>
            </label>
          </div>

          {accountType === "company" ? (
            <div className="field">
              <label htmlFor="companyName">Company Name</label>
              <div
                className={`input-wrap${signupErrors.companyName ? " invalid" : ""}`}
              >
                <input
                  id="companyName"
                  name="companyName"
                  type="text"
                  placeholder="Type at least 3 characters..."
                  maxLength={80}
                  autoComplete="organization"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>
              <small className="error">{signupErrors.companyName}</small>
            </div>
          ) : (
            <div>
              <div className="social-row social-row-single">
                <button
                  type="button"
                  className="social-btn google-btn"
                  onClick={handleGoogleSignup}
                >
                  <img src="/images/google.svg" alt="" />
                  Continue with Google
                </button>
              </div>

              <div className="divider">
                <span>OR</span>
              </div>

              <div className="field-grid">
                <div className="field">
                  <label htmlFor="firstName">First Name</label>
                  <div
                    className={`input-wrap${signupErrors.firstName ? " invalid" : ""}`}
                  >
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      placeholder="Jane"
                      maxLength={80}
                      autoComplete="given-name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                  <small className="error">{signupErrors.firstName}</small>
                </div>

                <div className="field">
                  <label htmlFor="lastName">Last Name</label>
                  <div
                    className={`input-wrap${signupErrors.lastName ? " invalid" : ""}`}
                  >
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      placeholder="Parker"
                      maxLength={80}
                      autoComplete="family-name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                  <small className="error">{signupErrors.lastName}</small>
                </div>
              </div>
            </div>
          )}

          <div className="field">
            <label htmlFor="email">
              {accountType === "company" ? "Work Email" : "Email"}
            </label>
            <div
              className={`input-wrap${signupErrors.email ? " invalid" : ""}`}
            >
              <input
                id="email"
                name="email"
                type="email"
                placeholder={
                  accountType === "company"
                    ? "name@company.com"
                    : "you@example.com"
                }
                maxLength={120}
                autoComplete="email"
                required
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
              />
            </div>
            <small className="error">{signupErrors.email}</small>
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <div
              className={`input-wrap${signupErrors.password ? " invalid" : ""}`}
            >
              <input
                id="password"
                name="password"
                type={showSignupPassword ? "text" : "password"}
                placeholder="••••••••"
                minLength={8}
                maxLength={72}
                autoComplete="new-password"
                required
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
              />
              <button
                className="icon-btn toggle-password"
                type="button"
                aria-label={
                  showSignupPassword ? "Hide password" : "Show password"
                }
                onClick={() => setShowSignupPassword((v) => !v)}
              >
                {showSignupPassword ? "🙈" : "👁"}
              </button>
            </div>
            <meter
              className="password-meter"
              min={0}
              max={4}
              value={Math.min(4, passwordScore(signupPassword))}
            />
            <small className="hint">
              Minimum 8 characters, with uppercase, lowercase, number and symbol
              recommended.
            </small>
            <small className="error">{signupErrors.password}</small>
          </div>

          <div className="captcha-box">
            <div>
              <strong>Security check</strong>
              <p>
                Solve this quick captcha:{" "}
                <span className="captcha-question">
                  {signupCaptcha.question}
                </span>
              </p>
            </div>
            <button
              className="captcha-refresh"
              type="button"
              aria-label="Refresh captcha"
              onClick={signupCaptcha.refresh}
            >
              Refresh
            </button>
            <input
              className="captcha-answer"
              type="number"
              inputMode="numeric"
              placeholder="Answer"
              required
              value={signupCaptcha.value}
              onChange={(e) => signupCaptcha.setValue(e.target.value)}
            />
          </div>
          <small className="captcha-error error">{signupCaptcha.error}</small>

          <label className="check-line">
            <input
              type="checkbox"
              required
              checked={terms}
              onChange={(e) => setTerms(e.target.checked)}
            />
            <span>
              I agree to the <Link to="/terms-service">Terms of Service</Link>{" "}
              and <Link to="/privacy-policy">Privacy Policy</Link>.
            </span>
          </label>

          <label className="check-line muted">
            <input
              type="checkbox"
              checked={marketing}
              onChange={(e) => setMarketing(e.target.checked)}
            />
            <span>
              I agree to receive emails about recruitment services from Bildyx.
              I can unsubscribe at any time.
            </span>
          </label>

          <button className="submit-btn" type="submit" disabled={isSigningUp}>
            {isSigningUp
              ? "..."
              : accountType === "company"
                ? "Create Company Account"
                : "Create Job Seeker Account"}
          </button>
        </form>

        <form
          className={`auth-form${activeTab === "login" ? " active" : ""}`}
          noValidate
          onSubmit={handleLogin}
        >
          <div className="form-heading center">
            <h2>Log In</h2>
            <p>Welcome back! Please enter your details.</p>
          </div>

          <div className="field">
            <label htmlFor="loginEmail">Email</label>
            <div className={`input-wrap${loginErrors.email ? " invalid" : ""}`}>
              <input
                id="loginEmail"
                name="email"
                type="email"
                placeholder="you@example.com"
                maxLength={120}
                autoComplete="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
              />
            </div>
            <small className="error">{loginErrors.email}</small>
          </div>

          <div className="field">
            <div className="label-row">
              <label htmlFor="loginPassword">Password</label>
              <Link to="/forgot-password">Forgot password?</Link>
            </div>
            <div
              className={`input-wrap${loginErrors.password ? " invalid" : ""}`}
            >
              <input
                id="loginPassword"
                name="password"
                type={showLoginPassword ? "text" : "password"}
                placeholder="••••••••"
                maxLength={72}
                autoComplete="current-password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
              />
              <button
                className="icon-btn toggle-password"
                type="button"
                aria-label={
                  showLoginPassword ? "Hide password" : "Show password"
                }
                onClick={() => setShowLoginPassword((v) => !v)}
              >
                {showLoginPassword ? "🙈" : "👁"}
              </button>
            </div>
            <small className="error">{loginErrors.password}</small>
          </div>

          <div className="captcha-box">
            <div>
              <strong>Security check</strong>
              <p>
                Solve this quick captcha:{" "}
                <span className="captcha-question">
                  {loginCaptcha.question}
                </span>
              </p>
            </div>
            <button
              className="captcha-refresh"
              type="button"
              aria-label="Refresh captcha"
              onClick={loginCaptcha.refresh}
            >
              Refresh
            </button>
            <input
              className="captcha-answer"
              type="number"
              inputMode="numeric"
              placeholder="Answer"
              required
              value={loginCaptcha.value}
              onChange={(e) => loginCaptcha.setValue(e.target.value)}
            />
          </div>
          <small className="captcha-error error">{loginCaptcha.error}</small>

          <button className="submit-btn" type="submit" disabled={isLoggingIn}>
            {isLoggingIn ? "..." : "Log In"}
          </button>

          <p className="switch-text">
            Don&apos;t have an account?{" "}
            <button
              type="button"
              className="link-btn"
              onClick={() => setActiveTab("signup")}
            >
              Sign up
            </button>
          </p>
        </form>
      </AuthLayout>

      <Footer />
    </>
  );
}
