import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "../lib/toast";
import { AuthService } from "../services/auth.service";
import { savePendingAccountType } from "../lib/authSession";
import { useCaptcha } from "../hooks/useCaptcha";
import { passwordScore } from "../lib/formHelpers";
import FormField from "./FormField";
import CaptchaBox from "./CaptchaBox";
import ValidatedForm from "./ValidatedForm";
import type { SignupInput } from "../services/auth.service";
import { useFormValidation } from "../hooks/useFormValidation";
import { SignupInputSchema } from "@repo/models/auth";

const authService = new AuthService();

type AccountType = "company" | "seeker";

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

  const [accountType, setAccountType] = useState<AccountType>("company");
  const [companyName, setCompanyName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [terms, setTerms] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const signupCaptcha = useCaptcha();

  const { errors, validateForm, setErrors } =
    useFormValidation(SignupInputSchema);

  async function handleSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const basePayload = {
      email: signupEmail.trim(),
      password: signupPassword.trim(),
      marketing,
    };

    const payload: SignupInput =
      accountType === "company"
        ? {
            accountType: "company",
            companyName: companyName.trim(),
            ...basePayload,
          }
        : {
            accountType: "seeker",
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            ...basePayload,
          };

    // 1. On lance TOUTES les validations
    const isFormValid = validateForm(payload); // Met les inputs en rouge via Zod
    const isCaptchaValid = signupCaptcha.verify(); // Affiche l'erreur de captcha

    if (!isFormValid || !isCaptchaValid) {
      return;
    }

    if (!terms) {
      toast.error("Please accept the Terms and Privacy Policy.");
      return;
    }

    // 3. Soumission API si tout est vert
    setIsSigningUp(true);
    try {
      const data = await authService.signup(payload);
      savePendingAccountType(accountType, data.userId);
      toast.success("Account created! Please verify your email.");
      navigate(`/verify-email?userId=${encodeURIComponent(data.userId)}`);
    } catch (err) {
      // ... gestion d'erreur API
    } finally {
      setIsSigningUp(false);
    }
  }

  const handleAccountTypeChange = (type: AccountType) => {
    setAccountType(type);
    setErrors({});
  };

  return (
    <ValidatedForm
      className={`auth-form${isActive ? " active" : ""}`}
      errors={errors}
      setErrors={setErrors}
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
            onChange={() => handleAccountTypeChange("company")}
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
            onChange={() => handleAccountTypeChange("seeker")}
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
          error={errors.companyName}
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
              error={errors.firstName}
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
              error={errors.lastName}
            />
          </div>
        </div>
      )}

      <FormField
        id="signupEmail"
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
        error={errors.email}
      />

      <FormField
        id="signupPassword"
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
        error={errors.password}
        showPasswordToggle={true}
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
    </ValidatedForm>
  );
}
