import { apiPost } from "./httpClient";

export type SignupInput = { accountType?: string; email: string; password: string; [key: string]: unknown };
export type SignupOutput = { userId: string; user?: { id: string; email: string } };

export type LoginInput = { email: string; password: string };
export type LoginOutput = { user: { id: string; email: string; accountType?: string }; token?: string };

export type VerifyEmailInput = { email: string; code: string };
export type VerifyEmailOutput = { user: { id: string; email: string } };

export type ForgotPasswordInput = { email: string };
export type ForgotPasswordOutput = { success: boolean };

export type ResetPasswordInput = { email: string; token: string; newPassword: string };
export type ResetPasswordOutput = { success: boolean };

export type ResendVerificationInput = { email: string };
export type ResendVerificationOutput = { success: boolean };

export type CancelUnverifiedInput = { userId: string };
export type CancelUnverifiedOutput = { success: boolean };

/** See src/services/httpClient.ts — TODO: swap for the real @repo/api-client oRPC client. */
export class AuthService {
  public signup(input: SignupInput) {
    return apiPost<SignupOutput>("/auth/signup", input);
  }

  public login(input: LoginInput) {
    return apiPost<LoginOutput>("/auth/login", input);
  }

  public verifyEmail(input: VerifyEmailInput) {
    return apiPost<VerifyEmailOutput>("/auth/verify-email", input);
  }

  public forgotPassword(input: ForgotPasswordInput) {
    return apiPost<ForgotPasswordOutput>("/auth/forgot-password", input);
  }

  public resetPassword(input: ResetPasswordInput) {
    return apiPost<ResetPasswordOutput>("/auth/reset-password", input);
  }

  public resendVerification(input: ResendVerificationInput) {
    return apiPost<ResendVerificationOutput>("/auth/resend-verification", input);
  }

  public logout(token?: string) {
    return apiPost<{ success: boolean }>("/auth/logout", { token });
  }

  public cancelUnverified(input: CancelUnverifiedInput) {
    return apiPost<CancelUnverifiedOutput>("/auth/cancel-unverified", input);
  }
}
