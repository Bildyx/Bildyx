/* =========================================================
   Bildyx - Authentication debug logic
   No database is connected yet.

   Handles:
   - client-side validation
   - demo captcha
   - demo login rate limiting
   - dynamic left panel content
   - debug output with localStorage
   ========================================================= */

/* ---------- State ---------- */

const state = {
    captchas: {},
    attempts: JSON.parse(localStorage.getItem("bildyx_attempts") || "{}")
};

/* ---------- DOM helpers ---------- */

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

/* ---------- Branding content ---------- */

const brandContent = {
    company: {
        title: `"Right Teams. Right<br>Candidates."`,
        features: [
            {
                title: "For Companies",
                text: "Build profile and present your teams to potential candidates."
            },
            {
                title: "For Job Seekers",
                text: "Create a powerful microresume in minutes. Use Microresume as elevator pitch to potential employers."
            }
        ]
    },
    job_seeker: {
        title: "Create your<br>microresume and<br>get discovered.",
        features: [
            {
                title: "Stand out fast",
                text: "Turn your experience into a short, sharp microresume recruiters can review in minutes."
            },
            {
                title: "Show team fit",
                text: "Highlight the kind of teams, products, and work style that match what you want next."
            }
        ]
    }
};

/* ---------- UI helpers ---------- */

function toast(message) {
    const el = $("#toast");

    if (!el) {
        return;
    }

    el.textContent = message;
    el.classList.add("show");

    setTimeout(() => {
        el.classList.remove("show");
    }, 2600);
}

function sanitize(value) {
    return String(value || "").replace(/[<>'"&]/g, character => ({
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;",
        "&": "&amp;"
    }[character]));
}

function validEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

function passwordScore(password) {
    return [
        password.length >= 8,
        /[A-Z]/.test(password),
        /[a-z]/.test(password),
        /\d/.test(password),
        /[^A-Za-z0-9]/.test(password)
    ].filter(Boolean).length;
}

function setError(input, message) {
    if (!input) {
        return;
    }

    const field = input.closest(".field");
    const wrap = input.closest(".input-wrap");

    if (wrap) {
        wrap.classList.toggle("invalid", Boolean(message));
    }

    if (field) {
        const error = $(".error", field);

        if (error) {
            error.textContent = message || "";
        }
    }
}

/* ---------- Dynamic left panel ---------- */

function updateBrandPanel(type) {
    const panel = $("#brandPanel");
    const title = $("#brandTitle");
    const featureCards = $$(".brand-feature");
    const data = brandContent[type] || brandContent.company;

    if (panel) {
        panel.classList.toggle("job-seeker", type === "job_seeker");
    }

    if (title) {
        title.innerHTML = data.title;
    }

    featureCards.forEach((card, index) => {
        const feature = data.features[index];

        if (!feature) {
            return;
        }

        const featureTitle = $(".brand-feature-title", card);
        const featureText = $(".brand-feature-text", card);

        if (featureTitle) {
            featureTitle.textContent = feature.title;
        }

        if (featureText) {
            featureText.textContent = feature.text;
        }
    });
}

/* ---------- Captcha ---------- */

function generateCaptcha(name) {
    const box = document.querySelector(`[data-captcha="${name}"]`);

    if (!box) {
        return;
    }

    const a = Math.floor(Math.random() * 8) + 2;
    const b = Math.floor(Math.random() * 8) + 2;

    state.captchas[name] = a + b;

    $(".captcha-question", box).textContent = `${a} + ${b} = ?`;
    $(".captcha-answer", box).value = "";

    if (box.nextElementSibling) {
        box.nextElementSibling.textContent = "";
    }
}

function checkCaptcha(name) {
    const box = document.querySelector(`[data-captcha="${name}"]`);

    if (!box) {
        return true;
    }

    const answer = Number($(".captcha-answer", box).value);
    const ok = answer === state.captchas[name];

    if (box.nextElementSibling) {
        box.nextElementSibling.textContent = ok ? "" : "Captcha is incorrect.";
    }

    return ok;
}

/* ---------- Local demo rate limit ---------- */

function tooManyAttempts(email) {
    const now = Date.now();
    const key = email.toLowerCase();

    const rows = (state.attempts[key] || []).filter(time => {
        return now - time < 10 * 60 * 1000;
    });

    state.attempts[key] = rows;
    localStorage.setItem("bildyx_attempts", JSON.stringify(state.attempts));

    return rows.length >= 5;
}

function addAttempt(email) {
    const key = email.toLowerCase();

    state.attempts[key] = state.attempts[key] || [];
    state.attempts[key].push(Date.now());

    localStorage.setItem("bildyx_attempts", JSON.stringify(state.attempts));
}

/* ---------- Debug ---------- */

function debug(payload) {
    const safePayload = JSON.parse(JSON.stringify(payload, (key, value) => {
        if (key.toLowerCase().includes("password")) {
            return "[hidden for security]";
        }

        return value;
    }));

    const output = $("#debugOutput");

    if (output) {
        output.textContent = JSON.stringify(safePayload, null, 2);
    }

    localStorage.setItem("bildyx_last_debug", JSON.stringify(safePayload));
}

/* ---------- Tabs ---------- */

$$(".tab, .link-btn").forEach(button => {
    button.addEventListener("click", () => {
        const target = button.dataset.target;

        if (!target) {
            return;
        }

        $$(".tab").forEach(tab => {
            const active = tab.dataset.target === target;

            tab.classList.toggle("active", active);
            tab.setAttribute("aria-selected", active);
        });

        $$(".auth-form").forEach(form => {
            form.classList.toggle("active", form.id === target);
        });
    });
});

/* ---------- Password visibility ---------- */

$$(".toggle-password").forEach(button => {
    button.addEventListener("click", () => {
        const input = button.previousElementSibling;

        if (!input) {
            return;
        }

        input.type = input.type === "password" ? "text" : "password";
    });
});

/* ---------- Captcha refresh ---------- */

$$(".captcha-refresh").forEach(button => {
    button.addEventListener("click", () => {
        const box = button.closest(".captcha-box");

        if (box) {
            generateCaptcha(box.dataset.captcha);
        }
    });
});

/* ---------- Account type switch ---------- */

function updateAccountTypeUI() {
    const checked = $('input[name="accountType"]:checked');

    if (!checked) {
        return;
    }

    const type = checked.value;
    const isCompany = type === "company";

    $$(".account-option").forEach(label => {
        label.classList.toggle("active", label.querySelector("input").checked);
    });

    $$(".company-only").forEach(element => {
        element.classList.toggle("hidden", !isCompany);
    });

    $$(".seeker-only").forEach(element => {
        element.classList.toggle("hidden", isCompany);
    });

    const submitButton = $(".submit-btn", $("#signup-form"));

    if (submitButton) {
        submitButton.textContent = isCompany
            ? "Create Company Account"
            : "Create Job Seeker Account";
    }

    const subtitle = $("#signupSubtitle");

    if (subtitle) {
        subtitle.textContent = isCompany
            ? "Select your account type to get started."
            : "Choose the job seeker path to build your microresume.";
    }

    const emailLabel = $("#signupEmailLabel");
    const emailInput = $("#signupEmail");

    if (emailLabel && emailInput) {
        emailLabel.textContent = isCompany ? "Work Email" : "Email";
        emailInput.placeholder = isCompany ? "name@company.com" : "jane@example.com";
    }

    updateBrandPanel(type);
}

$$('input[name="accountType"]').forEach(radio => {
    radio.addEventListener("change", updateAccountTypeUI);
});

/* ---------- Password meter ---------- */

const signupPassword = $("#signupPassword");

if (signupPassword) {
    signupPassword.addEventListener("input", event => {
        const meter = $(".password-meter");

        if (meter) {
            meter.value = Math.min(4, passwordScore(event.target.value));
        }
    });
}

/* ---------- Sign up submit ---------- */

const signupForm = $("#signup-form");

if (signupForm) {
    signupForm.addEventListener("submit", event => {
        event.preventDefault();

        let ok = true;

        const type = $('input[name="accountType"]:checked').value;
        const isCompany = type === "company";

        const companyNameInput = $("#companyName");
        const firstNameInput = $("#firstName");
        const lastNameInput = $("#lastName");
        const desiredRoleInput = $("#desiredRole");
        const emailInput = $("#signupEmail");
        const passwordInput = $("#signupPassword");

        if (isCompany) {
            if (companyNameInput.value.trim().length < 3) {
                setError(companyNameInput, "Minimum 3 characters.");
                ok = false;
            } else {
                setError(companyNameInput, "");
            }
        } else {
            if (firstNameInput.value.trim().length < 2) {
                setError(firstNameInput, "Minimum 2 characters.");
                ok = false;
            } else {
                setError(firstNameInput, "");
            }

            if (lastNameInput.value.trim().length < 2) {
                setError(lastNameInput, "Minimum 2 characters.");
                ok = false;
            } else {
                setError(lastNameInput, "");
            }

            if (desiredRoleInput.value.trim().length < 3) {
                setError(desiredRoleInput, "Minimum 3 characters.");
                ok = false;
            } else {
                setError(desiredRoleInput, "");
            }
        }

        if (!validEmail(emailInput.value)) {
            setError(emailInput, "Enter a valid email.");
            ok = false;
        } else {
            setError(emailInput, "");
        }

        if (passwordInput.value.length < 8) {
            setError(passwordInput, "Password must contain at least 8 characters.");
            ok = false;
        } else {
            setError(passwordInput, "");
        }

        if (!checkCaptcha("signup")) {
            ok = false;
        }

        if (!$("#terms").checked) {
            toast("Please accept the Terms and Privacy Policy.");
            ok = false;
        }

        if (!ok) {
            return;
        }

        const displayName = isCompany
            ? companyNameInput.value.trim()
            : `${firstNameInput.value.trim()} ${lastNameInput.value.trim()}`;

        const payload = {
            action: "SIGN_UP_DEBUG",
            createdAt: new Date().toISOString(),
            accountType: type,
            displayName: sanitize(displayName),
            companyName: isCompany ? sanitize(companyNameInput.value.trim()) : undefined,
            firstName: !isCompany ? sanitize(firstNameInput.value.trim()) : undefined,
            lastName: !isCompany ? sanitize(lastNameInput.value.trim()) : undefined,
            desiredRole: !isCompany ? sanitize(desiredRoleInput.value.trim()) : undefined,
            email: sanitize(emailInput.value.trim()),
            passwordLength: passwordInput.value.length,
            marketing: $("#marketing").checked,
            status: "validated_not_sent_no_database"
        };

        debug(payload);
        toast("Debug sign up validated. No database connected.");

        generateCaptcha("signup");
        signupForm.reset();

        const meter = $(".password-meter");

        if (meter) {
            meter.value = 0;
        }

        updateAccountTypeUI();
    });
}

/* ---------- Login submit ---------- */

const loginForm = $("#login-form");

if (loginForm) {
    loginForm.addEventListener("submit", event => {
        event.preventDefault();

        let ok = true;

        const email = $("#loginEmail").value.trim();
        const passwordInput = $("#loginPassword");

        if (!validEmail(email)) {
            setError($("#loginEmail"), "Enter a valid email.");
            ok = false;
        } else {
            setError($("#loginEmail"), "");
        }

        if (passwordInput.value.length < 1) {
            setError(passwordInput, "Password is required.");
            ok = false;
        } else {
            setError(passwordInput, "");
        }

        if (!checkCaptcha("login")) {
            ok = false;
        }

        if (!ok) {
            return;
        }

        if (tooManyAttempts(email)) {
            toast("Too many login attempts. Try again later.");

            debug({
                action: "LOGIN_BLOCKED_DEBUG",
                email: sanitize(email),
                reason: "rate_limit_5_attempts_10_minutes"
            });

            return;
        }

        addAttempt(email);

        debug({
            action: "LOGIN_DEBUG",
            createdAt: new Date().toISOString(),
            email: sanitize(email),
            passwordLength: passwordInput.value.length,
            status: "validated_not_sent_no_database",
            security: "local demo rate limit active"
        });

        toast("Debug login validated. No database connected.");

        generateCaptcha("login");
        loginForm.reset();
    });
}

/* ---------- Debug panel ---------- */

const debugToggle = $("#debugToggle");

if (debugToggle) {
    debugToggle.addEventListener("click", () => {
        $("#debugContent").classList.toggle("open");
    });
}

const clearDebug = $("#clearDebug");

if (clearDebug) {
    clearDebug.addEventListener("click", () => {
        localStorage.removeItem("bildyx_last_debug");
        $("#debugOutput").textContent = "Waiting for form submission...";
        toast("Debug cleared");
    });
}

const fakeSuccess = $("#fakeSuccess");

if (fakeSuccess) {
    fakeSuccess.addEventListener("click", () => {
        debug({
            action: "FAKE_SUCCESS",
            createdAt: new Date().toISOString(),
            message: "This simulates a successful server response."
        });
    });
}

/* ---------- Initialisation ---------- */

["signup", "login", "forgot", "reset"].forEach(generateCaptcha);

updateAccountTypeUI();

const last = localStorage.getItem("bildyx_last_debug");

if (last && $("#debugOutput")) {
    $("#debugOutput").textContent = JSON.stringify(JSON.parse(last), null, 2);
}
