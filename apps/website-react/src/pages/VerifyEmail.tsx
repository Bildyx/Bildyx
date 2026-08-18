import { FormEvent, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import AuthLayout from "../components/AuthLayout";
import { usePageMeta } from "../hooks/usePageMeta";
import { extractErrorMessage } from "../lib/formHelpers";
import { toast } from "../lib/toast";
import { AuthService } from "../services/auth.service";
import { UserService } from "../services/user.service";
import {
  getAuthUser,
  getRedirectPath,
  saveBildyxSession,
} from "../lib/authSession";

const authService = new AuthService();
const userService = new UserService();

export default function VerifyEmail() {
  usePageMeta("Bildyx — Verify Email", "Verify your Bildyx email address.");

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const userId = searchParams.get("userId") || "";

  const [email, setEmail] = useState("");
  const emailRef = useRef("");
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [pageError, setPageError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (!userId) {
      navigate("/login");
      return;
    }

    (async () => {
      try {
        const user = await userService.getById(userId);
        setEmail(user.email);
        emailRef.current = user.email;
      } catch (err) {
        console.error(err);
        toast.error("Error loading verification screen");
      }
    })();
  }, [userId, navigate]);

  useEffect(() => {
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      if (emailRef.current) {
        event.preventDefault();
        event.returnValue = "";
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  useEffect(() => {
    async function cancelUnverifiedAccountAndGo(targetPath: string) {
      const confirmed = window.confirm(
        "Your email is not verified yet. If you leave this page, your account will be deleted and you will need to create a new one. Continue?",
      );
      if (!confirmed) return;

      if (userId) {
        try {
          await userService.delete(userId);
        } catch (err) {
          console.error(err);
        }
      }

      emailRef.current = "";
      navigate(targetPath);
    }

    function handleDocumentClick(event: MouseEvent) {
      const link = (event.target as HTMLElement)?.closest?.(
        "a[href]",
      ) as HTMLAnchorElement | null;
      if (!link) return;

      const path = new URL(link.href, window.location.origin).pathname;
      if (emailRef.current && (path === "/login" || path === "/")) {
        event.preventDefault();
        cancelUnverifiedAccountAndGo(path);
      }
    }

    document.addEventListener("click", handleDocumentClick);
    return () => document.removeEventListener("click", handleDocumentClick);
  }, [userId, navigate]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!code.trim()) {
      setCodeError("Enter your verification code.");
      return;
    }
    setCodeError("");

    setIsSubmitting(true);
    try {
      const data = await authService.verifyEmail({
        email: email.trim(),
        code: code.trim(),
      });
      toast.success("Email verified! Redirecting to your profile...");
      emailRef.current = "";

      const verifiedUser = getAuthUser(data);

      saveBildyxSession(verifiedUser, email.trim());

      setTimeout(async () => {
        navigate(await getRedirectPath(verifiedUser));
      }, 1500);
    } catch (err) {
      const message = extractErrorMessage(err, "Verification failed");
      const finalMessage =
        message.includes("expired") || message.includes("410")
          ? `${message}. Your account has been deleted. Please create a new account.`
          : message;
      setPageError(finalMessage);
      toast.error(finalMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResend() {
    if (!email) {
      toast.warning("Email missing");
      return;
    }

    setIsResending(true);
    try {
      await authService.resendVerification({ email: email.trim() });
      toast.success("A new verification code has been sent. Check your email.");
    } catch (err) {
      const message = extractErrorMessage(err, "Unable to resend code");
      setPageError(message);
      toast.error(message);
    } finally {
      setIsResending(false);
    }
  }

  return (
    <>
      <Header />

      <AuthLayout formLabel="Email verification page">
        <form className="auth-form active" noValidate onSubmit={handleSubmit}>
          <div className="form-heading center">
            <h2>Verify your email</h2>
            <p>Enter the code we just emailed you.</p>
          </div>

          <p className="switch-text">
            Verification target:{" "}
            <strong>{email || "your email address"}</strong>
          </p>

          {pageError && (
            <p
              style={{
                display: "block",
                margin: "12px 0 0",
                color: "#dc2626",
                fontWeight: 700,
                textAlign: "center",
              }}
            >
              {pageError}
            </p>
          )}

          <div className="field">
            <label htmlFor="verifyCode">Verification code</label>
            <div className={`input-wrap${codeError ? " invalid" : ""}`}>
              <img className="input-icon" src="/images/image.png" alt="" />
              <input
                id="verifyCode"
                name="code"
                type="text"
                placeholder="e.g. ABC123"
                maxLength={6}
                autoComplete="one-time-code"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>
            <small className="error">{codeError}</small>
          </div>

          <button className="submit-btn" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "..." : "Verify"}
          </button>
          <button
            className="link-btn"
            type="button"
            style={{ marginTop: 12 }}
            onClick={handleResend}
            disabled={isResending}
          >
            {isResending ? "..." : "Resend code"}
          </button>

          <p className="switch-text" style={{ marginTop: 16 }}>
            Already verified?{" "}
            <Link className="link-btn" to="/login">
              Log in
            </Link>
          </p>
        </form>
      </AuthLayout>

      <Footer />
    </>
  );
}
