// @ts-nocheck
import { AuthService } from "../services/auth.service";
import { toast, setError, startButtonLoading, generateCaptcha, checkCaptcha } from "./helpers";

const authService = new AuthService();


function getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        email: params.get('email') || '',
        token: params.get('token') || ''
    };
}

const resetForm = document.getElementById('reset-form') as HTMLFormElement | null;
if (resetForm) {
    resetForm.addEventListener('submit', async event => {
        event.preventDefault();
        const { email, token } = getQueryParams();
        const passwordInput = document.getElementById('resetPassword') as HTMLInputElement | null;
        const confirmInput = document.getElementById('confirmPassword') as HTMLInputElement | null;
        let ok = true;

        if (!passwordInput || passwordInput.value.length < 8) {
            setError(passwordInput, 'Password must contain at least 8 characters.');
            ok = false;
        } else {
            setError(passwordInput, '');
        }

        if (!confirmInput || confirmInput.value !== passwordInput?.value) {
            setError(confirmInput, 'Passwords do not match.');
            ok = false;
        } else {
            setError(confirmInput, '');
        }

        if (!checkCaptcha('reset')) ok = false;
        if (!ok) return;

        let stopLoading;
        try {
            const submitBtn = resetForm.querySelector('.submit-btn') as HTMLButtonElement | null;
            if (submitBtn) stopLoading = startButtonLoading(submitBtn);

            await authService.resetPassword({ email, token, newPassword: passwordInput.value });
            toast.success('Password updated successfully. You can now log in.');
            setTimeout(() => {
                window.location.href = 'login.php';
            }, 2000);

        } catch (err) {
            console.error(err);
            let errorData;
            try {
                errorData = JSON.parse(err.message);
            } catch (_) {}
            toast.error(errorData?.message || err?.message || 'Unable to reset password');
        } finally {
            if (stopLoading) stopLoading();
        }

        generateCaptcha('reset');
        resetForm.reset();
    });
}
