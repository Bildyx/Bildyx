import React, { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "../lib/toast";
import { AuthService } from "../services/auth.service";
import { savePendingAccountType } from "../lib/authSession";
import { useCaptcha } from "../hooks/useCaptcha";
import { extractErrorMessage, passwordScore } from "../lib/formHelpers";
import FormField from "./FormField";
import CaptchaBox from "./CaptchaBox";
import type { SignupInput } from "../services/auth.service";

const authService = new AuthService();

type AccountType = "company" | "seeker";
type FieldErrors = Record<string, string>;

type RegisterFormProps = {
  isActive: boolean;
  handleGoogleSignup: () => void;
  handleLinkedinSignup: () => void;
};

export default function RegisterForm({
  isActive,
  handleGoogleSignup,
  handleLinkedinSignup,
}: RegisterFormProps) {
  const navigate = useNavigate();

  // ─── Signup form state ──────────────────────────────────────
  const [accountType, setAccountType] = useState<AccountType>("company");
  const [companyName, setCompanyName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [terms, setTerms] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [signupErrors, setSignupErrors] = useState<FieldErrors>({});
  const [isSigningUp, setIsSigningUp] = useState(false);
  const signupCaptcha = useCaptcha();

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
      toast.success("Account created! Please verify your email.");
      navigate(`/verify-email?userId=${encodeURIComponent(data.userId)}`);
    } catch (err) {
      console.error(err);
      let errorData:
        | { data?: { issues?: { path: string[]; message: string }[] } }
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

  return (
    <form
      className={`auth-form${isActive ? " active" : ""}`}
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
        <FormField
          id="companyName"
          name="companyName"
          label="Company Name"
          type="text"
          placeholder="Type at least 3 characters..."
          maxLength={80}
          autoComplete="organization"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          error={signupErrors.companyName}
        />
      ) : (
        <div>
          <div className="social-row">
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

          <div className="divider">
            <span>OR</span>
          </div>

          <div className="field-grid">
            <FormField
              id="firstName"
              name="firstName"
              label="First Name"
              type="text"
              placeholder="Jane"
              maxLength={80}
              autoComplete="given-name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              error={signupErrors.firstName}
            />

            <FormField
              id="lastName"
              name="lastName"
              label="Last Name"
              type="text"
              placeholder="Parker"
              maxLength={80}
              autoComplete="family-name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              error={signupErrors.lastName}
            />
          </div>
        </div>
      )}

      <FormField
        id="email"
        name="email"
        label={accountType === "company" ? "Work Email" : "Email"}
        type="email"
        placeholder={
          accountType === "company" ? "name@company.com" : "you@example.com"
        }
        maxLength={120}
        autoComplete="email"
        required
        value={signupEmail}
        onChange={(e) => setSignupEmail(e.target.value)}
        error={signupErrors.email}
      />

      <FormField
        id="password"
        name="password"
        label="Password"
        type="password"
        placeholder="••••••••"
        minLength={8}
        maxLength={72}
        autoComplete="new-password"
        required
        value={signupPassword}
        onChange={(e) => setSignupPassword(e.target.value)}
        error={signupErrors.password}
        showPasswordToggle={true}
        hint="Minimum 8 characters, with uppercase, lowercase, number and symbol recommended."
      >
        <meter
          className="password-meter"
          min={0}
          max={4}
          value={Math.min(4, passwordScore(signupPassword))}
        />
      </FormField>

      <CaptchaBox captcha={signupCaptcha} />

      <label className="check-line">
        <input
          type="checkbox"
          required
          checked={terms}
          onChange={(e) => setTerms(e.target.checked)}
        />
        <span>
          I agree to the <Link to="/terms-service">Terms of Service</Link> and{" "}
          <Link to="/privacy-policy">Privacy Policy</Link>.
        </span>
      </label>

      <label className="check-line muted">
        <input
          type="checkbox"
          checked={marketing}
          onChange={(e) => setMarketing(e.target.checked)}
        />
        <span>
          I agree to receive emails about recruitment services from Bildyx. I
          can unsubscribe at any time.
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
  );
}
