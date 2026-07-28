/*
 * Authentication utilities and form handlers
 *
 * This module centralises all the JavaScript logic shared across the
 * authentication pages: sign up, log in, forgot password, reset
 * password and verify email. It provides helper functions for
 * sanitising input, validating email addresses, scoring passwords,
 * generating simple math captchas, rate limiting login attempts and
 * capturing form submissions into localStorage for debug purposes.
 *
 * Each page conditionally binds event listeners only if the
 * corresponding elements exist to avoid errors on pages where the
 * elements are absent. The debug panel and toast notifications are
 * available on all pages.
 */

// Maintain a global state for captchas and login attempts. Captcha
// answers are stored by name to allow multiple captchas on the same
// page (e.g. signup vs login). Attempts are persisted in
// localStorage so the rate limit survives page reloads.
const state = {
  captchas: {},
  attempts: JSON.parse(localStorage.getItem('bildyx_attempts') || '{}')
};

// Shortcuts for querying the DOM. `$` returns the first match, and
// `$$` returns an array of all matches. An optional root element can
// be passed to scope the search.
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

// Dynamically load Toastify-js CSS and JS
(function () {
  if (!document.querySelector('link[href*="toastify-js"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = 'https://cdn.jsdelivr.net/npm/toastify-js/src/toastify.min.css';
    document.head.appendChild(link);
  }

  if (typeof Toastify === 'undefined') {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/toastify-js';
    script.async = false;
    document.head.appendChild(script);
  }
})();

// Display a toast notification with a given message and type.
// Supports: 'success', 'error', 'warning', 'info'
function toast(message, type = 'info') {
  if (typeof Toastify === 'undefined') {
    setTimeout(() => toast(message, type), 100);
    return;
  }

  let backgroundColor = '#2244ec'; // Default info (Bildyx primary)
  if (type === 'success') {
    backgroundColor = '#10b981'; // Emerald green
  } else if (type === 'error') {
    backgroundColor = '#ef4444'; // Rose red
  } else if (type === 'warning') {
    backgroundColor = '#f59e0b'; // Amber yellow
  }

  Toastify({
    text: message,
    duration: 3500,
    close: true,
    gravity: 'top',
    position: 'right',
    stopOnFocus: true,
    style: {
      background: backgroundColor,
      color: '#ffffff',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSize: '14px',
      fontWeight: '600',
      borderRadius: '12px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      padding: '12px 20px',
    }
  }).showToast();
}

// Add typed shortcut helper methods
toast.success = (message) => toast(message, 'success');
toast.error = (message) => toast(message, 'error');
toast.warning = (message) => toast(message, 'warning');
toast.info = (message) => toast(message, 'info');

// Sanitise a value to prevent XSS by escaping special HTML
// characters. Always apply sanitisation before outputting user data.
function sanitize(value) {
  return String(value || '').replace(/[<>'"&]/g, c => {
    return {
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;',
      '&': '&amp;'
    }[c];
  });
}

// Validate an email address using a simple regular expression. This
// regex checks for a basic "local@domain.tld" pattern and rejects
// obvious invalid addresses.
function validEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

// Score a password based on length and character variety. Returns a
// value between 0 and 5 inclusive. This is used to drive a meter
// element that visually indicates password strength.
function passwordScore(pwd) {
  const checks = [
    pwd.length >= 8,
    /[A-Z]/.test(pwd),
    /[a-z]/.test(pwd),
    /\d/.test(pwd),
    /[^A-Za-z0-9]/.test(pwd)
  ];
  return checks.filter(Boolean).length;
}

// Validate that an email address is not from a common free provider
// such as Gmail or Yahoo. This is used to encourage users to sign up
// with a professional email address for company accounts.
function validProfessionalEmail(email) {
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
    "gmx.fr"
  ];

  const domain = email.split("@")[1]?.toLowerCase();

  return domain && !blockedDomains.includes(domain);
}

// Display or clear an error message for a given input. The function
// finds the closest parent with the class 'field' to locate the
// corresponding error element. It also toggles the 'invalid' class on
// the input wrapper for styling.
function setError(input, message) {
  const field = input?.closest('.field');
  const wrap = input?.closest('.input-wrap');
  if (wrap) {
    wrap.classList.toggle('invalid', Boolean(message));
  }
  if (field) {
    const errorEl = $('.error', field);
    if (errorEl) {
      errorEl.textContent = message || '';
    }
  }
}

// Animate a button to show a loading state with a dot animation. The
// button is disabled during the animation. The function returns a
// cleanup function that stops the animation and restores the button's
// original state.
function startButtonLoading(button) {
  const originalText = button.textContent;
  let dots = 0;

  button.disabled = true;
  button.textContent = ".";

  const interval = setInterval(() => {
    dots = (dots + 1) % 4;
    button.textContent = ".".repeat(dots || 1);
  }, 350);

  return () => {
    clearInterval(interval);
    button.disabled = false;
    button.textContent = originalText;
  };
}

// Generate a simple addition captcha. Captchas are stored in
// `state.captchas` keyed by name so that multiple forms can have
// independent challenges. The associated DOM elements are located via
// the `data-captcha` attribute.
function generateCaptcha(name) {
  const a = Math.floor(Math.random() * 8) + 2;
  const b = Math.floor(Math.random() * 8) + 2;
  state.captchas[name] = a + b;
  const box = document.querySelector(`[data-captcha="${name}"]`);
  if (!box) return;
  $('.captcha-question', box).textContent = `${a} + ${b} = ?`;
  $('.captcha-answer', box).value = '';
  // Clear any lingering error message next to the box
  const errorEl = box.nextElementSibling;
  if (errorEl) errorEl.textContent = '';
}

// Validate a captcha answer against the stored value. Displays an
// inline error message when incorrect. Returns true if correct.
function checkCaptcha(name) {
  const box = document.querySelector(`[data-captcha="${name}"]`);
  if (!box) return true;
  const answer = Number($('.captcha-answer', box).value);
  const ok = answer === state.captchas[name];
  const errorEl = box.nextElementSibling;
  if (errorEl) {
    errorEl.textContent = ok ? '' : 'Captcha is incorrect.';
  }
  return ok;
}

// Determine whether the user has exceeded the allowed number of
// login attempts in the past 10 minutes. Blocks login when there
// have been 5 or more attempts. Attempts are stored per email to
// avoid blocking all users.
function tooManyAttempts(email) {
  const now = Date.now();
  const key = email.toLowerCase();
  const rows = (state.attempts[key] || []).filter(t => now - t < 10 * 60 * 1000);
  state.attempts[key] = rows;
  localStorage.setItem('bildyx_attempts', JSON.stringify(state.attempts));
  return rows.length >= 5;
}

// Record a login attempt timestamp for rate limiting.
function addAttempt(email) {
  const key = email.toLowerCase();
  state.attempts[key] = state.attempts[key] || [];
  state.attempts[key].push(Date.now());
  localStorage.setItem('bildyx_attempts', JSON.stringify(state.attempts));
}

// Write debug information to the on‑page console and persist a
// redacted version of it in localStorage. Sensitive fields such as
// passwords are masked. The debug output is shown in the element
// with id 'debugOutput' if present.
function debug(payload) {
  const safePayload = JSON.parse(JSON.stringify(payload, (key, value) => {
    return key.toLowerCase().includes('password') ? '[hidden for security]' : value;
  }));
  const out = $('#debugOutput');
  if (out) {
    out.textContent = JSON.stringify(safePayload, null, 2);
  }
  localStorage.setItem('bildyx_last_debug', JSON.stringify(safePayload));
}

/*
 * Event bindings
 *
 * The following code attaches event listeners to the authentication
 * forms. Each binding is conditional on the existence of the
 * corresponding element so that this script can be safely loaded on
 * pages that do not contain all forms (e.g. forgot password). When
 * elements are present, handlers perform client-side validation,
 * enforce captcha checks, apply rate limiting on login and emit
 * debug events instead of sending real requests.
 */

// Tab navigation on the combined login/signup page: switch between
// forms when clicking the tabs or the small link buttons.
$$('.tab, .link-btn').forEach(button => {
  button.addEventListener('click', () => {
    const target = button.dataset.target;
    // Only handle tabs that define a target
    if (!target) return;
    $$('.tab').forEach(tab => {
      const active = tab.dataset.target === target;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', active);
    });
    $$('.auth-form').forEach(form => {
      form.classList.toggle('active', form.id === target);
    });
  });
});

// Toggle password visibility on any field with the 'toggle-password'
// button. Switches between text and password types and swaps the
// emoji accordingly. Guard against missing inputs.
$$('.toggle-password').forEach(button => {
  button.addEventListener('click', () => {
    const input = button.previousElementSibling;
    if (!input) return;
    input.type = input.type === 'password' ? 'text' : 'password';
    button.textContent = input.type === 'password' ? '👁' : '🙈';
  });
});

// Refresh captchas on click. Each refresh button lives inside a
// captcha box so we walk up to find the name.
$$('.captcha-refresh').forEach(button => {
  button.addEventListener('click', () => {
    const box = button.closest('.captcha-box');
    if (box) {
      const name = box.dataset.captcha;
      generateCaptcha(name);
    }
  });
});

// Pre-generate common captchas for pages that contain these boxes.
['signup', 'login', 'forgot', 'reset'].forEach(name => generateCaptcha(name));

// Account type switcher on sign up page: toggles between company
// and job seeker fields and updates the submit button label.
$$('input[name="accountType"]').forEach(radio => {
  radio.addEventListener('change', () => {
    // Highlight the selected card
    $$('.account-option').forEach(option => {
      option.classList.toggle('active', option.querySelector('input').checked);
    });
    const isCompany = $('input[name="accountType"]:checked').value === 'company';
    $('.company-only')?.classList.toggle('hidden', !isCompany);
    $('.seeker-only')?.classList.toggle('hidden', isCompany);
    const submitBtn = $('.submit-btn', $('#signup-form'));
    if (submitBtn) {
      submitBtn.textContent = isCompany ? 'Create Company Account' : 'Create Job Seeker Account';
    }

    // Update the email label and placeholder based on account type
    const signupEmailLabel = document.getElementById("signupEmailLabel");
    const signupEmailInput = document.getElementById("signupEmail");

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

// Strength meter for the sign up page. Update the meter value as the
// user types. Use Math.min to clamp the score to the meter’s max.
const password = $('#password');
if (password) {
  password.addEventListener('input', e => {
    const meter = $('.password-meter');
    if (meter) meter.value = Math.min(4, passwordScore(e.target.value));
  });
}

// Base URL for all authentication API endpoints.  If you host the
// server at a different root (e.g. behind a proxy), update this
// constant accordingly.  A relative path works for the default
// http-server setup used in this project.
const API_BASE = "http://localhost:3000/api/auth";
console.log("AUTH FILE LOADED", API_BASE);

// Sign up form submission: validate fields, captcha and terms.  On
// success, POST to the backend to create a new profile.  The
// verification code will be emailed by the server; the client
// navigates to the verification page to let the user input the
// code.
const signupForm = $('#signup-form');
if (signupForm) {
  signupForm.addEventListener('submit', async e => {
    console.log("SIGNUP CLICKED");
    e.preventDefault();
    let ok = true;

    const accountType = $('input[name="accountType"]:checked').value;
    const emailInput = $('#email');
    const passwordInput = $('#password');
    const companyInput = $('#companyName');
    const firstNameInput = $('#firstName');
    const lastNameInput = $('#lastName');
    const marketingInput = $('#marketing');

    const email = emailInput?.value.trim();
    const password = passwordInput?.value.trim();
    const firstName = firstNameInput?.value.trim();
    const lastName = lastNameInput?.value.trim();
    const companyName = companyInput?.value.trim();
    const marketing = marketingInput?.checked;

    // Captcha must be correct
    if (!checkCaptcha('signup')) {
      toast.warning('Please enter the captcha.');
      ok = false;
    }

    // Terms checkbox must be checked
    const terms = $('#terms');
    if (terms && !terms.checked) {
      toast.warning('Please accept the Terms and Privacy Policy.');
      ok = false;
    }

    if (!ok) return;

    // Compose request body
    const body = {
      accountType,
      email,
      password,
      marketing,
    };

    if(accountType === "company") {
      body.companyName = companyName
    } else {
      body.firstName = firstName
      body.lastName = lastName
    }

    let stopLoading;

    try {
      stopLoading = startButtonLoading(signupForm.querySelector(".submit-btn"));

      const resp = await fetch(`${API_BASE}/signup`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

      const data = await resp.json().catch(() => ({}));
      
      // 1. On commence par nettoyer toutes les anciennes erreurs du formulaire
      // En passant un message vide '', setError va retirer la classe 'invalid' et vider le texte
      signupForm.querySelectorAll('input').forEach(input => setError(input, ''));

      if (resp.status === 200) {
        window.location.href = `verify-email.html?userId=${encodeURIComponent(data.userId)}`;
      } else if (resp.status === 400 && data.data.issues) {
        
        // 2. On boucle sur chaque erreur renvoyée par le serveur
        data.data.issues.forEach(issue => {
          const fieldName = issue.path[0]; // ex: "email", "password", "firstName"...
          
          // 3. On cible le bon élément Input
          let inputElement = $(`#${fieldName}`); 

          // 4. On applique ton système d'erreur
          if (inputElement) {
            setError(inputElement, issue.message);
          }
        });

        toast.error('Veuillez corriger les erreurs dans le formulaire.');
      } else {
        toast.error(data.message || 'Sign up failed (error code: ' + resp.status+ ")");
      }

        } catch (err) {
      console.error("Signup fetch error:", err);

      toast.error(
        err instanceof Error
          ? err.message
          : "Could not connect to the API"
      );
    } finally {
      if (stopLoading) stopLoading();
    }
  });
}

// Login form submission: validate email, password, captcha and apply
// rate limiting. Logs debug data instead of submitting to a server.
const loginForm = $('#login-form');
if (loginForm) {
  loginForm.addEventListener('submit', async e => {
    e.preventDefault();
    let ok = true;
    const emailInput = $('#loginEmail');
    const passwordInput = $('#loginPassword');
    const email = emailInput?.value.trim() || '';
    // Validate email
    if (!validEmail(email)) {
      setError(emailInput, 'Enter a valid email.');
      ok = false;
    } else {
      setError(emailInput, '');
    }
    // Validate password
    if (!passwordInput || passwordInput.value.length === 0) {
      setError(passwordInput, 'Password is required.');
      ok = false;
    } else {
      setError(passwordInput, '');
    }
    // Captcha must be correct
    if (!checkCaptcha('login')) ok = false;
    if (!ok) return;
    // Apply client-side rate limiting: block after too many attempts in a short period
    if (tooManyAttempts(email)) {
      toast.warning('Too many login attempts. Try again later.');
      return;
    }
    let stopLoading;
    try {
      stopLoading = startButtonLoading(loginForm.querySelector(".submit-btn"));

      const resp = await fetch(`${API_BASE}/login`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          password: passwordInput.value
        })
    });
      const data = await resp.json().catch(() => ({}));
      if (resp.status === 200) {
        // Login successful: store session info and redirect to profile
        if (window.BildyxAPI && data.user) {
          window.BildyxAPI.setSession({
            userId: data.user.id,
            email: data.user.email,
            role: data.user.role,
            profileId: null, // will be fetched lazily by api.js
          });
        }
        window.location.href = 'profile.php';
      } else {
        // Record attempt on failure
        addAttempt(email);
        toast.error(data.message || 'Invalid credentials');
      }
    } catch (err) {
      console.error(err);
      toast.error('Could not connect to server');
    } finally {
      if (stopLoading) stopLoading();
    }
  });
}

// Toggle debug panel visibility
const debugToggle = $('#debugToggle');
if (debugToggle) {
  debugToggle.addEventListener('click', () => {
    $('#debugContent')?.classList.toggle('open');
  });
}

// Clear debug history
const clearDebug = $('#clearDebug');
if (clearDebug) {
  clearDebug.addEventListener('click', () => {
    localStorage.removeItem('bildyx_last_debug');
    const out = $('#debugOutput');
    if (out) out.textContent = 'Waiting for form submission...';
    toast.success('Debug cleared');
  });
}

// Fake success action to demonstrate debug panel usage
const fakeSuccess = $('#fakeSuccess');
if (fakeSuccess) {
  fakeSuccess.addEventListener('click', () => {
    debug({
      action: 'FAKE_SUCCESS',
      createdAt: new Date().toISOString(),
      message: 'This simulates a successful server response.'
    });
    toast.success('Debug: fake success emitted.');
  });
}

// Forgot password link inside the login form: capture the click
// event to record debug information. The actual navigation happens via
// the href attribute so we do not preventDefault here.
const forgotPasswordLink = $('#forgotPassword');
if (forgotPasswordLink) {
  forgotPasswordLink.addEventListener('click', e => {
    // Only act if the user has entered an email; otherwise it's not useful
    const emailValue = $('#loginEmail')?.value || '';
    debug({
      action: 'FORGOT_PASSWORD_CLICKED',
      email: sanitize(emailValue),
      status: 'debug_only'
    });
    // A toast is sufficient feedback for the user
    toast.info('Password reset page can be connected later.');
  });
}

// On page load, restore the last debug output if available. This
// helps when switching between pages to see what was last submitted.
const last = localStorage.getItem('bildyx_last_debug');
if (last) {
  const out = $('#debugOutput');
  if (out) out.textContent = JSON.stringify(JSON.parse(last), null, 2);
}

function activateAuthTab(target) {
  if (!target) return;

  $$('.tab').forEach(tab => {
    const active = tab.dataset.target === target;

    tab.classList.toggle('active', active);
    tab.setAttribute('aria-selected', active);
  });

  $$('.auth-form').forEach(form => {
    form.classList.toggle('active', form.id === target);
  });
}

const params = new URLSearchParams(window.location.search);
const tab = params.get('tab');

if (tab === 'signup') {
  activateAuthTab('signup-form');
}

if (tab === 'login') {
  activateAuthTab('login-form');
}

// Google OAuth button: opens a popup window to initiate the OAuth flow.
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
            `
            width=${width},
            height=${height},
            left=${left},
            top=${top},
            popup=yes,
            menubar=no,
            toolbar=no,
            location=no,
            status=no,
            resizable=yes,
            scrollbars=yes
            `
        );
    });
}

window.addEventListener("message", (event) => {
    if (event.origin !== "http://localhost:3000") return;

    if (event.data?.type === "GOOGLE_LOGIN_SUCCESS") {
        window.location.href = "profile.php";
    }
});