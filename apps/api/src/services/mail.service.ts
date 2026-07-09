import nodemailer from "nodemailer";

let transporter: any;
if (process.env.SMTP_HOST) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
} else {
  transporter = {
    sendMail: async (opts: any) => {
      console.log("Simulated email sending:", opts);
      return { messageId: "debug" };
    },
  };
}

export async function sendVerificationEmail(
  email: string,
  code: string,
): Promise<void> {
  const subject = "Bildyx – Verify your email address";
  const text =
    `Your Bildyx verification code is: ${code}\n\n` +
    "Enter this code on the verification page to activate your account.";
  try {
    await transporter.sendMail({
      from: process.env.MAIL_FROM || "no-reply@bildyx.com",
      to: email,
      subject,
      text,
    });
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
}

export async function sendResetEmail(
  email: string,
  token: string,
): Promise<void> {
  const link = `${process.env.RESET_BASE_URL || "http://localhost:5500/reset-password.html"}?token=${token}&email=${encodeURIComponent(email)}`;
  const subject = "Bildyx – Reset your password";
  const text =
    `We received a request to reset your Bildyx password.\n\n` +
    `If you made this request, click the link below and choose a new password:\n${link}\n\n` +
    `If you did not request a password reset, please ignore this email.`;
  try {
    await transporter.sendMail({
      from: process.env.MAIL_FROM || "no-reply@bildyx.com",
      to: email,
      subject,
      text,
    });
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
}
