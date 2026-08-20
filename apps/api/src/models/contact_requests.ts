import { z } from "zod";

export const ContactRequestSchema = z.object({
  id: z.uuid(),
  firstname: z.string().trim().min(1, "First name is required."),
  lastname: z.string().trim().min(1, "Last name is required."),
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .email("Invalid email address."),
  subject: z.string().trim().min(1, "Subject is required."),
  message: z.string().trim().min(10, "Message must be at least 10 characters."),
});

export const PostContactRequestSchema = ContactRequestSchema.omit({ id: true });
export const DeleteContactRequestSchema = z.object({
  contactRequestId: z.string().uuid("Invalid ID."),
});

export type ContactRequest = z.infer<typeof ContactRequestSchema>;
export type PostContactRequest = z.infer<typeof PostContactRequestSchema>;
export type DeleteContactRequest = z.infer<typeof DeleteContactRequestSchema>;
