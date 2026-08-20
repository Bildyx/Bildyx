import { z } from "zod";
import { UserRoleEnum, UserStatusEnum } from "./utils/enums";

export const SignupInputSchema = z.discriminatedUnion("accountType", [
  z.object({
    accountType: z.literal("company"),
    companyName: z
      .string()
      .trim()
      .min(3, "Company name must be at least 3 characters."),
    email: z
      .string()
      .trim()
      .min(1, "Work email is required.")
      .email("Invalid email address."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    marketing: z.boolean().optional().default(false),
  }),
  z.object({
    accountType: z.literal("seeker"),
    firstName: z.string().trim().min(1, "First name is required."),
    lastName: z.string().trim().min(1, "Last name is required."),
    email: z
      .string()
      .trim()
      .min(1, "Email is required.")
      .email("Invalid email address."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    marketing: z.boolean().optional().default(false),
  }),
]);

export const SignupOutputSchema = z.object({
  message: z.string(),
  email: z.string(),
  userId: z.string(),
  verification_code: z.string().optional(),
});

export const LoginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

export const LoginInputSchema = LoginSchema;

export const LoginOutputSchema = z.object({
  token: z.string(),
  user: z.object({
    id: z.string().uuid("Invalid user ID."),
    email: z.string().email(),
    first_name: z.string().nullable().optional(),
    last_name: z.string().nullable().optional(),
    role: UserRoleEnum,
    profile_id: z.string().uuid().nullable().optional(),
    organization_id: z.string().uuid().nullable().optional(),
  }),
});

export const VerifyEmailInputSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .email("Invalid email address."),
  code: z.string().trim().min(1, "Verification code is required."),
});

export const VerifyEmailOutputSchema = z.object({
  message: z.string(),
  token: z.string().optional(),
  user: z
    .object({
      id: z.string().uuid(),
      email: z.string().email(),
      role: UserRoleEnum,
      profile_id: z.string().uuid().nullable().optional(),
      organization_id: z.string().uuid().nullable().optional(),
    })
    .optional(),
});

export const ForgotPasswordInputSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .email("Invalid email address."),
});

export const ForgotPasswordOutputSchema = z.object({
  message: z.string(),
  reset_token: z.string().optional(),
});

export const ResetPasswordInputSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .email("Invalid email address."),
  token: z.string().trim().min(1, "Reset token is required."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export const ResetPasswordOutputSchema = z.object({
  message: z.string(),
});

export const ResendVerificationInputSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .email("Invalid email address."),
});

export const ResendVerificationOutputSchema = z.object({
  message: z.string(),
  verification_code: z.string().optional(),
});

export const LogoutInputSchema = z.object({
  token: z.string().min(1).optional(),
});

export const LogoutOutputSchema = z.object({
  message: z.string(),
});

export const CancelUnverifiedInputSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .email("Invalid email address."),
});

export const CancelUnverifiedOutputSchema = z.object({
  message: z.string(),
});

export type SignupInput = z.infer<typeof SignupInputSchema>;
export type SignupOutput = z.infer<typeof SignupOutputSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
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
export type LogoutInput = z.infer<typeof LogoutInputSchema>;
export type LogoutOutput = z.infer<typeof LogoutOutputSchema>;
export type CancelUnverifiedInput = z.infer<typeof CancelUnverifiedInputSchema>;
export type CancelUnverifiedOutput = z.infer<
  typeof CancelUnverifiedOutputSchema
>;
