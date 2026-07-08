import { z } from "zod";
import { UserRoleEnum, UserStatusEnum } from "./utils/enums";

export const SignupInputSchema = z.object({
  accountType: z.enum(["company", "seeker"]),
  email: z.email(),
  password: z.string().min(8),
  marketing: z.boolean().optional().default(false),
  companyName: z.string().min(3).optional(),
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
});

export const SignupOutputSchema = z.object({
  message: z.string(),
  email: z.string(),
  userId: z.string(),
  verification_code: z.string().optional(), // Provided plain for development / debugging ease
});

export const LoginInputSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export const LoginOutputSchema = z.object({
  token: z.string(),
  user: z.object({
    id: z.string().uuid(),
    email: z.email(),
    first_name: z.string().nullable().optional(),
    last_name: z.string().nullable().optional(),
    role: UserRoleEnum,
  }),
});

export const VerifyEmailInputSchema = z.object({
  email: z.email(),
  code: z.string().min(1),
});

export const VerifyEmailOutputSchema = z.object({
  message: z.string(),
  token: z.string().optional(),
  user: z
    .object({
      id: z.string().uuid(),
      email: z.email(),
      role: UserRoleEnum,
    })
    .optional(),
});

export const ForgotPasswordInputSchema = z.object({
  email: z.email(),
});

export const ForgotPasswordOutputSchema = z.object({
  message: z.string(),
  reset_token: z.string().optional(), // Provided plain for development / debugging ease
});

export const ResetPasswordInputSchema = z.object({
  email: z.email(),
  token: z.string().min(1),
  password: z.string().min(8),
});

export const ResetPasswordOutputSchema = z.object({
  message: z.string(),
});

export const ResendVerificationInputSchema = z.object({
  email: z.email(),
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
