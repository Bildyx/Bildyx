// @ts-nocheck
import { AuthService } from "../services/auth.service";
import { UserService } from "../services/user.service";
import { $, $$, toast, setError, startButtonLoading } from "./helpers";

const authService = new AuthService();
const userService = new UserService();

(async function () {
  const params = new URLSearchParams(window.location.search);
  const userId = params.get("userId") || "";

  if (!userId) {
    window.location.href = "login.php";
    return;
  }

  let email = "";
  try {
    const user = await userService.getById(userId);
    email = user.email;
    const emailSpan = $("#verifyEmail");
    if (emailSpan) emailSpan.textContent = email;
  } catch (err) {
    console.error(err);
    toast.error("Error loading verification screen");
    return;
  }

  $$("a[href]").forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      if (
        email &&
        href &&
        href !== "#" &&
        (href.includes("login.php") || href.includes("index.php"))
      ) {
        event.preventDefault();
        cancelUnverifiedAccountAndGo(href);
      }
    });
  });

  function showVerificationError(message) {
    const errorBox = $("#verifyError");
    if (errorBox) {
      errorBox.textContent = message;
      errorBox.style.display = "block";
    }
    toast.error(message);
  }

  async function cancelUnverifiedAccountAndGo(targetUrl) {
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

    email = ""; // Prevent beforeunload prompt
    window.location.href = targetUrl;
  }

  window.addEventListener("beforeunload", (event) => {
    if (email) {
      event.preventDefault();
      event.returnValue = "";
    }
  });

  const verifyForm = $("#verify-form");
  if (verifyForm) {
    verifyForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const codeInput = $("#verifyCode");
      if (!codeInput || !codeInput.value.trim()) {
        setError(codeInput, "Enter your verification code.");
        return;
      }
      setError(codeInput, "");

      let stopLoading;
      try {
        stopLoading = startButtonLoading(
          verifyForm.querySelector(".submit-btn"),
        );
        const data = await authService.verifyEmail({
          email: email.trim(),
          code: codeInput.value.trim(),
        });

        toast.success("Email verified! Redirecting to your profile...");
        email = ""; // Prevent beforeunload prompt

        const sessionInfo = {
          userId: data.user.id,
          profileId: null,
        };
        sessionStorage.setItem("bildyx_session", JSON.stringify(sessionInfo));

        setTimeout(() => {
          window.location.href = "profile.php";
        }, 1500);
      } catch (err) {
        console.error(err);
        let errorData;
        try {
          errorData = JSON.parse(err.message);
        } catch (_) {}
        const message =
          errorData?.message || err?.message || "Verification failed";
        if (message.includes("expired") || message.includes("410")) {
          showVerificationError(
            message +
              ". Your account has been deleted. Please create a new account.",
          );
        } else {
          showVerificationError(message);
        }
      } finally {
        if (stopLoading) stopLoading();
      }
    });
  }

  const resendBtn = $("#resendVerification");
  if (resendBtn) {
    resendBtn.addEventListener("click", async () => {
      if (!email) {
        toast.warning("Email missing");
        return;
      }
      let stopLoading;
      try {
        stopLoading = startButtonLoading(resendBtn);
        await authService.resendVerification({ email: email.trim() });
        toast.success(
          "A new verification code has been sent. Check your email.",
        );
      } catch (err) {
        console.error(err);
        let errorData;
        try {
          errorData = JSON.parse(err.message);
        } catch (_) {}
        const message =
          errorData?.message || err?.message || "Unable to resend code";
        showVerificationError(message);
      } finally {
        if (stopLoading) stopLoading();
      }
    });
  }
})();
