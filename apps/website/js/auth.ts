// @ts-nocheck
import { AuthService } from "../services/auth.service";
import { UserService } from "../services/user.service";
import {
  $,
  $$,
  toast,
  setError,
  startButtonLoading,
  validEmail,
  passwordScore,
  sanitize,
  generateCaptcha,
  checkCaptcha,
  captchaAnswers,
} from "./helpers";

const authService = new AuthService();
const userService = new UserService();

const state = {
  attempts: JSON.parse(
    localStorage.getItem("bildyx_attempts") || "{}",
  ) as Record<string, number[]>,
};

function tooManyAttempts(email: string) {
  const now = Date.now();
  const key = email.toLowerCase();
  const rows = (state.attempts[key] || []).filter(
    (t: number) => now - t < 10 * 60 * 1000,
  );
  state.attempts[key] = rows;
  localStorage.setItem("bildyx_attempts", JSON.stringify(state.attempts));
  return rows.length >= 5;
}

function addAttempt(email: string) {
  const key = email.toLowerCase();
  state.attempts[key] = state.attempts[key] || [];
  state.attempts[key].push(Date.now());
  localStorage.setItem("bildyx_attempts", JSON.stringify(state.attempts));
}

function validProfessionalEmail(email: string) {
  if (!validEmail(email)) return false;
  const blockedDomains = [
    "gmail.com",
    "googlemail.com",
    "yahoo.com",
    "yahoo.fr",
    "hotmail.com",
    "hotmail.fr",
    "outlook.com",
    "outlook.fr",
    "live.com",
    "icloud.com",
    "me.com",
    "aol.com",
    "proton.me",
    "protonmail.com",
    "gmx.com",
    "gmx.fr",
  ];
  const domain = email.split("@")[1]?.toLowerCase();
  return domain && !blockedDomains.includes(domain);
}

function normalizeAccountType(value: any) {
  const raw = String(value || "")
    .toLowerCase()
    .replace(/[\s_-]/g, "");

  if (
    [
      "company",
      "business",
      "employer",
      "organization",
      "organisation",
      "recruiter",
    ].includes(raw)
  ) {
    return "company";
  }

  if (
    [
      "seeker",
      "jobseeker",
      "jobseekers",
      "candidate",
      "student",
      "user",
    ].includes(raw)
  ) {
    return "seeker";
  }

  return raw;
}

function getAuthUser(data: any) {
  return data?.user || data?.data?.user || data?.data || data || {};
}

function readPendingAccountType(userId?: string) {
  if (userId) {
    return (
      sessionStorage.getItem(`bildyx_pending_account_type_${userId}`) ||
      localStorage.getItem(`bildyx_pending_account_type_${userId}`) ||
      sessionStorage.getItem("bildyx_pending_account_type") ||
      localStorage.getItem("bildyx_pending_account_type") ||
      ""
    );
  }

  return (
    sessionStorage.getItem("bildyx_pending_account_type") ||
    localStorage.getItem("bildyx_pending_account_type") ||
    ""
  );
}

function savePendingAccountType(accountType: string, userId?: string) {
  if (!accountType) return;

  sessionStorage.setItem("bildyx_pending_account_type", accountType);
  localStorage.setItem("bildyx_pending_account_type", accountType);

  if (userId) {
    sessionStorage.setItem(
      `bildyx_pending_account_type_${userId}`,
      accountType,
    );
    localStorage.setItem(`bildyx_pending_account_type_${userId}`, accountType);
  }
}

function clearPendingAccountType(userId?: string) {
  sessionStorage.removeItem("bildyx_pending_account_type");
  localStorage.removeItem("bildyx_pending_account_type");

  if (userId) {
    sessionStorage.removeItem(`bildyx_pending_account_type_${userId}`);
    localStorage.removeItem(`bildyx_pending_account_type_${userId}`);
  }
}

function getAccountType(user: any) {
  const accountType = normalizeAccountType(
    user?.accountType ||
      user?.account_type ||
      user?.userType ||
      user?.user_type ||
      user?.profileType ||
      user?.profile_type ||
      user?.role ||
      user?.type,
  );

  if (accountType) return accountType;

  return normalizeAccountType(readPendingAccountType());
}

function getRedirectUrl(user: any) {
  return getAccountType(user) === "company"
    ? "company_con_admin.php"
    : "profile.php";
}

function saveBildyxSession(user: any, fallbackEmail = "") {
  const sessionInfo = {
    userId: user?.id || user?.userId || user?._id || null,
    email: user?.email || fallbackEmail || "",
    role: user?.role || null,
    accountType: getAccountType(user),
    profileId: user?.profileId || user?.profile_id || null,
    companyId:
      user?.companyId ||
      user?.company_id ||
      user?.organizationId ||
      user?.organization_id ||
      null,
  };

  sessionStorage.setItem("bildyx_session", JSON.stringify(sessionInfo));
  localStorage.setItem("bildyx_session", JSON.stringify(sessionInfo));
  localStorage.setItem("bildyx_user", JSON.stringify(user || {}));

  return sessionInfo;
}

function debug(payload: any) {
  const safe = JSON.parse(
    JSON.stringify(payload, (k, v) =>
      k.toLowerCase().includes("password") ? "[hidden]" : v,
    ),
  );
  const out = $("#debugOutput");
  if (out) out.textContent = JSON.stringify(safe, null, 2);
  localStorage.setItem("bildyx_last_debug", JSON.stringify(safe));
}

document.addEventListener("DOMContentLoaded", () => {
  $$(".tab, .link-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.dataset.target;
      if (!target) return;
      $$(".tab").forEach((tab) => {
        const active = tab.dataset.target === target;
        tab.classList.toggle("active", active);
        tab.setAttribute("aria-selected", String(active));
      });
      $$(".auth-form").forEach((form) => {
        form.classList.toggle("active", form.id === target);
      });
    });
  });

  $$(".toggle-password").forEach((button) => {
    button.addEventListener("click", () => {
      const input = button.previousElementSibling as HTMLInputElement | null;
      if (!input) return;
      input.type = input.type === "password" ? "text" : "password";
      button.textContent = input.type === "password" ? "👁" : "🙈";
    });
  });

  $$(".captcha-refresh").forEach((button) => {
    button.addEventListener("click", () => {
      const box = button.closest(".captcha-box") as HTMLElement | null;
      if (box) {
        const name = box.dataset.captcha || "";
        generateCaptcha(name);
      }
    });
  });

  ["signup", "login", "forgot", "reset", "verify"].forEach((name) =>
    generateCaptcha(name),
  );

  $$('input[name="accountType"]').forEach((radio) => {
    radio.addEventListener("change", () => {
      $$(".account-option").forEach((option) => {
        const rb = option.querySelector("input") as HTMLInputElement | null;
        option.classList.toggle("active", Boolean(rb?.checked));
      });
      const checkedRadio = $(
        'input[name="accountType"]:checked',
      ) as HTMLInputElement | null;
      const isCompany = checkedRadio?.value === "company";
      $(".company-only")?.classList.toggle("hidden", !isCompany);
      $(".seeker-only")?.classList.toggle("hidden", isCompany);

      const signupForm = $("#signup-form");
      const submitBtn = signupForm ? $(".submit-btn", signupForm) : null;
      if (submitBtn) {
        submitBtn.textContent = isCompany
          ? "Create Company Account"
          : "Create Job Seeker Account";
      }

      const signupEmailLabel = document.getElementById("signupEmailLabel");
      const signupEmailInput = document.getElementById(
        "signupEmail",
      ) as HTMLInputElement | null;

      if (signupEmailLabel && signupEmailInput) {
        if (isCompany) {
          signupEmailLabel.textContent = "Work Email";
          signupEmailInput.placeholder = "name@company.com";
        } else {
          signupEmailLabel.textContent = "Email";
          signupEmailInput.placeholder = "you@example.com";
        }
      }
    });
  });

  const passwordInput = $("#password") as HTMLInputElement | null;
  if (passwordInput) {
    passwordInput.addEventListener("input", (e) => {
      const meter = $(".password-meter") as HTMLMeterElement | null;
      const target = e.target as HTMLInputElement;
      if (meter) meter.value = Math.min(4, passwordScore(target.value));
    });
  }

  const signupForm = $("#signup-form") as HTMLFormElement | null;
  if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      let ok = true;

      const checkedType = $(
        'input[name="accountType"]:checked',
      ) as HTMLInputElement | null;
      const accountType = checkedType?.value as "company" | "seeker";
      const emailInput = $("#email") as HTMLInputElement | null;
      const passwordInput = $("#password") as HTMLInputElement | null;
      const companyInput = $("#companyName") as HTMLInputElement | null;
      const firstNameInput = $("#firstName") as HTMLInputElement | null;
      const lastNameInput = $("#lastName") as HTMLInputElement | null;
      const marketingInput = $("#marketing") as HTMLInputElement | null;

      const email = emailInput?.value.trim() || "";
      const password = passwordInput?.value.trim() || "";
      const firstName = firstNameInput?.value.trim() || "";
      const lastName = lastNameInput?.value.trim() || "";
      const companyName = companyInput?.value.trim() || "";
      const marketing = Boolean(marketingInput?.checked);

      if (!checkCaptcha("signup")) {
        toast.warning("Please enter the captcha.");
        ok = false;
      }

      const terms = $("#terms") as HTMLInputElement | null;
      if (terms && !terms.checked) {
        toast.warning("Please accept the Terms and Privacy Policy.");
        ok = false;
      }

      if (!ok) return;

      const body: any = {
        accountType,
        email,
        password,
        marketing,
      };

      if (accountType === "company") {
        body.companyName = companyName;
      } else {
        body.firstName = firstName;
        body.lastName = lastName;
      }

      let stopLoading;

      try {
        const submitBtn = signupForm.querySelector(
          ".submit-btn",
        ) as HTMLButtonElement | null;
        if (submitBtn) stopLoading = startButtonLoading(submitBtn);

        const data = await authService.signup(body);

        savePendingAccountType(accountType, data.userId);

        signupForm
          .querySelectorAll("input")
          .forEach((input) => setError(input as HTMLInputElement, ""));
        window.location.href = `verify-email.php?userId=${encodeURIComponent(data.userId)}`;
      } catch (err: any) {
        console.error("Signup fetch error:", err);
        let errorData: any;
        try {
          errorData = JSON.parse(err.message);
        } catch (_) {}

        signupForm
          .querySelectorAll("input")
          .forEach((input) => setError(input as HTMLInputElement, ""));

        if (errorData?.data?.issues) {
          errorData.data.issues.forEach((issue: any) => {
            const fieldName = issue.path[0];
            const inputElement = $(`#${fieldName}`) as HTMLInputElement | null;
            if (inputElement) {
              setError(inputElement, issue.message);
            }
          });
          toast.error("Veuillez corriger les erreurs dans le formulaire.");
        } else {
          toast.error(errorData?.message || err?.message || "Sign up failed.");
        }
      } finally {
        if (stopLoading) stopLoading();
      }
    });
  }

  const loginForm = $("#login-form") as HTMLFormElement | null;
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      let ok = true;
      const emailInput = $("#loginEmail") as HTMLInputElement | null;
      const passwordInput = $("#loginPassword") as HTMLInputElement | null;
      const email = emailInput?.value.trim() || "";
      const password = passwordInput?.value || "";

      if (!validEmail(email)) {
        setError(emailInput, "Enter a valid email.");
        ok = false;
      } else {
        setError(emailInput, "");
      }

      if (password.length === 0) {
        setError(passwordInput, "Password is required.");
        ok = false;
      } else {
        setError(passwordInput, "");
      }

      if (!checkCaptcha("login")) ok = false;
      if (!ok) return;

      if (tooManyAttempts(email)) {
        toast.warning("Too many login attempts. Try again later.");
        return;
      }

      let stopLoading;
      try {
        const submitBtn = loginForm.querySelector(
          ".submit-btn",
        ) as HTMLButtonElement | null;
        if (submitBtn) stopLoading = startButtonLoading(submitBtn);

        const data = await authService.login({ email, password });
        const user = getAuthUser(data);

        saveBildyxSession(user, email);

        window.location.href = getRedirectUrl(user);
      } catch (err: any) {
        console.error(err);
        addAttempt(email);
        let errorData: any;
        try {
          errorData = JSON.parse(err.message);
        } catch (_) {}
        toast.error(
          errorData?.message || err?.message || "Invalid credentials",
        );
      } finally {
        if (stopLoading) stopLoading();
      }
    });
  }

  const last = localStorage.getItem("bildyx_last_debug");
  if (last) {
    const out = $("#debugOutput");
    if (out) out.textContent = JSON.stringify(JSON.parse(last), null, 2);
  }

  const urlParams = new URLSearchParams(window.location.search);
  const tab = urlParams.get("tab");

  if (tab === "signup") {
    activateAuthTab("signup-form");
  }

  if (tab === "login") {
    activateAuthTab("login-form");
  }

  const googleSignupBtn = document.getElementById("googleSignupBtn");
  if (googleSignupBtn) {
    googleSignupBtn.addEventListener("click", () => {
      const width = 520;
      const height = 650;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      window.open(
        "http://localhost:3000/api/auth/google",
        "GoogleLogin",
        `width=${width},height=${height},left=${left},top=${top},popup=yes,menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes`,
      );
    });
  }

  window.addEventListener("message", (event) => {
    if (event.origin !== "http://localhost:3000") return;

    if (event.data?.type === "GOOGLE_LOGIN_SUCCESS") {
      const user = getAuthUser(event.data);
      saveBildyxSession(user);
      window.location.href = getRedirectUrl(user);
    }
  });
});

function activateAuthTab(target: string) {
  if (!target) return;

  $$(".tab").forEach((tab) => {
    const active = tab.dataset.target === target;
    tab.classList.toggle("active", active);
    tab.setAttribute("aria-selected", String(active));
  });

  $$(".auth-form").forEach((form) => {
    form.classList.toggle("active", form.id === target);
  });
}

// ─── VERIFY EMAIL PAGE EVENTS ───────────────────────────
(async function () {
  const params = new URLSearchParams(window.location.search);
  const userId = params.get("userId") || "";
  if (!userId) return;

  let email = "";
  try {
    const user = await userService.getById(userId);
    email = user.email;

    const pendingAccountType =
      normalizeAccountType(
        user?.accountType || user?.account_type || user?.role,
      ) || readPendingAccountType(userId);

    if (pendingAccountType) {
      savePendingAccountType(pendingAccountType, userId);
    }
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
      const codeInput = $("#verifyCode") as HTMLInputElement | null;
      if (!codeInput || !codeInput.value.trim()) {
        setError(codeInput, "Enter your verification code.");
        return;
      }
      setError(codeInput, "");

      let stopLoading;
      try {
        stopLoading = startButtonLoading(
          verifyForm.querySelector(".submit-btn") as HTMLButtonElement,
        );
        const data = await authService.verifyEmail({
          email: email.trim(),
          code: codeInput.value.trim(),
        });

        toast.success("Email verified! Redirecting to your profile...");
        email = ""; // Prevent beforeunload prompt

        const verifiedUser = getAuthUser(data);
        const pendingAccountType = readPendingAccountType(userId);

        if (
          pendingAccountType &&
          !verifiedUser.accountType &&
          !verifiedUser.account_type
        ) {
          verifiedUser.accountType = pendingAccountType;
        }

        saveBildyxSession(verifiedUser, email.trim());
        clearPendingAccountType(userId);

        setTimeout(() => {
          window.location.href = getRedirectUrl(verifiedUser);
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
        stopLoading = startButtonLoading(resendBtn as HTMLButtonElement);
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

// ─── RESET PASSWORD PAGE EVENTS ──────────────────────────
const resetForm = document.getElementById(
  "reset-form",
) as HTMLFormElement | null;
if (resetForm) {
  resetForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const { email, token } = getQueryParams();
    const passwordInput = document.getElementById(
      "resetPassword",
    ) as HTMLInputElement | null;
    const confirmInput = document.getElementById(
      "confirmPassword",
    ) as HTMLInputElement | null;
    let ok = true;

    if (!passwordInput || passwordInput.value.length < 8) {
      setError(passwordInput, "Password must contain at least 8 characters.");
      ok = false;
    } else {
      setError(passwordInput, "");
    }

    if (!confirmInput || confirmInput.value !== passwordInput?.value) {
      setError(confirmInput, "Passwords do not match.");
      ok = false;
    } else {
      setError(confirmInput, "");
    }

    if (!checkCaptcha("reset")) ok = false;
    if (!ok) return;

    let stopLoading;
    try {
      const submitBtn = resetForm.querySelector(
        ".submit-btn",
      ) as HTMLButtonElement | null;
      if (submitBtn) stopLoading = startButtonLoading(submitBtn);

      await authService.resetPassword({
        email,
        token,
        newPassword: passwordInput.value,
      });
      toast.success("Password updated successfully. You can now log in.");
      setTimeout(() => {
        window.location.href = "login.php";
      }, 2000);
    } catch (err) {
      console.error(err);
      let errorData;
      try {
        errorData = JSON.parse(err.message);
      } catch (_) {}
      toast.error(
        errorData?.message || err?.message || "Unable to reset password",
      );
    } finally {
      if (stopLoading) stopLoading();
    }

    generateCaptcha("reset");
    resetForm.reset();
  });
}

function getQueryParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    email: params.get("email") || "",
    token: params.get("token") || "",
  };
}

// ─── FORGOT PASSWORD PAGE EVENTS ─────────────────────────
const forgotForm = document.getElementById(
  "forgot-form",
) as HTMLFormElement | null;
if (forgotForm) {
  forgotForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const emailInput = document.getElementById(
      "forgotEmail",
    ) as HTMLInputElement | null;
    let ok = true;

    if (!emailInput || !validEmail(emailInput.value.trim())) {
      setError(emailInput, "Enter a valid email.");
      ok = false;
    } else {
      setError(emailInput, "");
    }

    if (!checkCaptcha("forgot")) ok = false;
    if (!ok) return;

    let stopLoading;
    try {
      const submitBtn = forgotForm.querySelector(
        ".submit-btn",
      ) as HTMLButtonElement | null;
      if (submitBtn) stopLoading = startButtonLoading(submitBtn);

      await authService.forgotPassword({ email: emailInput.value.trim() });
      toast.success(
        "If an account exists, a reset link has been sent. Check your email.",
      );
    } catch (err) {
      console.error(err);
      let errorData;
      try {
        errorData = JSON.parse(err.message);
      } catch (_) {}
      toast.error(
        errorData?.message || err?.message || "Unable to send reset email",
      );
    } finally {
      if (stopLoading) stopLoading();
    }

    generateCaptcha("forgot");
    forgotForm.reset();
  });
}
