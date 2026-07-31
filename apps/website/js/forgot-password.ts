// @ts-nocheck
import { AuthService } from "../services/auth.service";
import { toast, setError, startButtonLoading, validEmail, generateCaptcha, checkCaptcha } from "./helpers";

const authService = new AuthService();


const forgotForm = document.getElementById('forgot-form') as HTMLFormElement | null;
if (forgotForm) {
    forgotForm.addEventListener('submit', async event => {
        event.preventDefault();
        const emailInput = document.getElementById('forgotEmail') as HTMLInputElement | null;
        let ok = true;

        if (!emailInput || !validEmail(emailInput.value.trim())) {
            setError(emailInput, 'Enter a valid email.');
            ok = false;
        } else {
            setError(emailInput, '');
        }

        if (!checkCaptcha('forgot')) ok = false;
        if (!ok) return;

        let stopLoading;
        try {
            const submitBtn = forgotForm.querySelector('.submit-btn') as HTMLButtonElement | null;
            if (submitBtn) stopLoading = startButtonLoading(submitBtn);

            await authService.forgotPassword({ email: emailInput.value.trim() });
            toast.success('If an account exists, a reset link has been sent. Check your email.');

        } catch (err) {
            console.error(err);
            let errorData;
            try {
                errorData = JSON.parse(err.message);
            } catch (_) {}
            toast.error(errorData?.message || err?.message || 'Unable to send reset email');
        } finally {
            if (stopLoading) stopLoading();
        }

        generateCaptcha('forgot');
        forgotForm.reset();
    });
}
