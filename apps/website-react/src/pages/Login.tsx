import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import AuthLayout from "../components/AuthLayout";
import FormField from "../components/FormField";
import CaptchaBox from "../components/CaptchaBox";
import RegisterForm from "../components/RegisterForm";
import { usePageMeta } from "../hooks/usePageMeta";
import { useCaptcha } from "../hooks/useCaptcha";
import { extractErrorMessage, validEmail } from "../lib/formHelpers";
import { toast } from "../lib/toast";
import {
  addAttempt,
  getAuthUser,
  getRedirectPath,
  saveBildyxSession,
  tooManyAttempts,
} from "../lib/authSession";
import { AuthService } from "../services/auth.service";
import { User } from "@repo/models/users";

const authService = new AuthService();

type FieldErrors = Record<string, string>;

export default function Login() {
  usePageMeta("Bildyx — Login / Sign Up", "Log in or create a Bildyx account.");

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialTab = searchParams.get("tab") === "signup" ? "signup" : "login";
  const [activeTab, setActiveTab] = useState<"login" | "signup">(initialTab);

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (
        event.data?.type === "GOOGLE_LOGIN_SUCCESS" ||
        event.data?.type === "LINKEDIN_LOGIN_SUCCESS"
      ) {
        const provider =
          event.data.type === "GOOGLE_LOGIN_SUCCESS" ? "Google" : "LinkedIn";
        try {
          const user = await authService.me();
          if (user) {
            saveBildyxSession(user, user.email);
            const redirectPath = await getRedirectPath(user);
            navigate(redirectPath);
          } else {
            toast.error(`Failed to load ${provider} session.`);
          }
        } catch (err) {
          toast.error(`${provider} authentication failed.`);
        }
      }
      if (event.data?.type === "LINKEDIN_LOGIN_ERROR") {
        toast.error(`LinkedIn error: ${event.data.error || "unknown error"}`);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [navigate]);

  // ─── Login form state ───────────────────────────────────────
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginErrors, setLoginErrors] = useState<FieldErrors>({});
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const loginCaptcha = useCaptcha();

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

  function handleLinkedinSignup() {
    const width = 520;
    const height = 650;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    window.open(
      `${process.env.API_URL}/api/auth/linkedin`,
      "LinkedInLogin",
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

        <RegisterForm
          isActive={activeTab === "signup"}
          handleGoogleSignup={handleGoogleSignup}
          handleLinkedinSignup={handleLinkedinSignup}
        />

        <form
          className={`auth-form${activeTab === "login" ? " active" : ""}`}
          noValidate
          onSubmit={handleLogin}
        >
          <div className="form-heading center">
            <h2>Log In</h2>
            <p>Welcome back! Please enter your details.</p>
          </div>

          <div className="social-row" style={{ marginBottom: 20 }}>
            <button
              type="button"
              className="social-btn google-btn"
              onClick={handleGoogleSignup}
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/3840px-Google_%22G%22_logo.svg.png?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=thumbnail"
                alt=""
              />
              Google
            </button>
            <button
              type="button"
              className="social-btn linkedin-btn"
              onClick={handleLinkedinSignup}
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/LinkedIn_icon.svg/3840px-LinkedIn_icon.svg.png?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=thumbnail"
                alt=""
              />
              LinkedIn
            </button>
          </div>

          <div className="divider" style={{ margin: "20px 0" }}>
            <span>OR</span>
          </div>

          <FormField
            id="loginEmail"
            name="email"
            label="Email"
            type="email"
            placeholder="you@example.com"
            maxLength={120}
            autoComplete="email"
            required
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
            error={loginErrors.email}
          />

          <FormField
            id="loginPassword"
            name="password"
            label="Password"
            type="password"
            placeholder="••••••••"
            maxLength={72}
            autoComplete="current-password"
            required
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            error={loginErrors.password}
            showPasswordToggle={true}
          >
            <div className="label-row">
              <Link to="/forgot-password">Forgot password?</Link>
            </div>
          </FormField>

          <CaptchaBox captcha={loginCaptcha} />

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
