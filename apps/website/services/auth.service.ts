import { z } from "zod";
import { getRPCClient } from "@repo/api-client";
import {
  SignupInputSchema,
  SignupOutputSchema,
  LoginInputSchema,
  LoginOutputSchema,
  VerifyEmailInputSchema,
  VerifyEmailOutputSchema,
  ForgotPasswordInputSchema,
  ForgotPasswordOutputSchema,
  ResetPasswordInputSchema,
  ResetPasswordOutputSchema,
  ResendVerificationInputSchema,
  ResendVerificationOutputSchema,
  LogoutOutputSchema,
  CancelUnverifiedInputSchema,
  CancelUnverifiedOutputSchema,
} from "@repo/models/auth";

export type SignupInput = z.infer<typeof SignupInputSchema>;
export type SignupOutput = z.infer<typeof SignupOutputSchema>;
export type LoginInput = z.infer<typeof LoginInputSchema>;
export type LoginOutput = z.infer<typeof LoginOutputSchema>;
export type VerifyEmailInput = z.infer<typeof VerifyEmailInputSchema>;
export type VerifyEmailOutput = z.infer<typeof VerifyEmailOutputSchema>;
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordInputSchema>;
export type ForgotPasswordOutput = z.infer<typeof ForgotPasswordOutputSchema>;
export type ResetPasswordInput = z.infer<typeof ResetPasswordInputSchema>;
export type ResetPasswordOutput = z.infer<typeof ResetPasswordOutputSchema>;
export type ResendVerificationInput = z.infer<
  typeof ResendVerificationInputSchema
>;
export type ResendVerificationOutput = z.infer<
  typeof ResendVerificationOutputSchema
>;
export type LogoutOutput = z.infer<typeof LogoutOutputSchema>;
export type CancelUnverifiedInput = z.infer<typeof CancelUnverifiedInputSchema>;
export type CancelUnverifiedOutput = z.infer<
  typeof CancelUnverifiedOutputSchema
>;

export class AuthService {
  private readonly rpcClient = getRPCClient("http://localhost:3000");

  public async signup(input: SignupInput): Promise<SignupOutput> {
    return await this.rpcClient.auth.signup(input);
  }

  public async login(input: LoginInput): Promise<LoginOutput> {
    return await this.rpcClient.auth.login(input);
  }

  public async verifyEmail(
    input: VerifyEmailInput,
  ): Promise<VerifyEmailOutput> {
    return await this.rpcClient.auth.verifyEmail(input);
  }

  public async forgotPassword(
    input: ForgotPasswordInput,
  ): Promise<ForgotPasswordOutput> {
    return await this.rpcClient.auth.forgotPassword(input);
  }

  public async resetPassword(
    input: ResetPasswordInput,
  ): Promise<ResetPasswordOutput> {
    return await this.rpcClient.auth.resetPassword(input);
  }

  public async resendVerification(
    input: ResendVerificationInput,
  ): Promise<ResendVerificationOutput> {
    return await this.rpcClient.auth.resendVerification(input);
  }

  public async logout(token?: string): Promise<LogoutOutput> {
    return await this.rpcClient.auth.logout({ token });
  }

  public async cancelUnverified(
    input: CancelUnverifiedInput,
  ): Promise<CancelUnverifiedOutput> {
    return await this.rpcClient.auth.cancelUnverified(input);
  }
}
