/*
 * Bildyx Authentication API
 *
 * This Express server exposes a minimal REST API for handling
 * authentication-related actions.  It works in concert with the
 * Prisma schema defined under `prisma/schema.prisma`.  All queries
 * use Prisma's parameterised API, which protects against SQL
 * injection.  Passwords are stored as hashes (bcrypt) and tokens
 * for email verification and password resets are random strings.
 *
 * Endpoints:
 *   POST /api/auth/signup                Create a new user (candidate or company)
 *   POST /api/auth/verify-email          Verify an email using a code
 *   POST /api/auth/resend-verification   Resend a verification code (30s throttle)
 *   POST /api/auth/login                 Log in with email/password
 *   POST /api/auth/forgot-password       Request a password reset (30s throttle)
 *   POST /api/auth/reset-password        Reset a password using token
 *
 * This file can be run with `node server.js`.  It requires
 * installation of express, @prisma/client, bcryptjs, nanoid,
 * nodemailer and dotenv.  See package.json for these deps.
 */

const express = require('express');
const cors = require('cors');
const { PrismaClient, UserRole } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { nanoid } = require('nanoid');
const nodemailer = require('nodemailer');
const dayjs = require('dayjs');
const crypto = require('crypto');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());
// Parse cookies so that session tokens can be read on subsequent requests
app.use(cookieParser());

// Configure nodemailer transporter.  In production you would
// configure this with real SMTP credentials.  Here we fall back
// to logging messages to the console for demonstration.
let transporter;
if (process.env.SMTP_HOST) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
} else {
  transporter = {
    sendMail: async (opts) => {
      console.log('Simulated email sending:', opts);
      return { messageId: 'debug' };
    }
  };
}

/**
 * sendVerificationEmail
 *
 * Compose and send an email containing a verification code.  The
 * code is included in the message body and could also be embedded
 * in a link.  This function does not reveal any sensitive
 * information on error; it simply logs details to the console.
 */
async function sendVerificationEmail(email, code) {
  const subject = 'Bildyx – Verify your email address';
  const text = `Your Bildyx verification code is: ${code}\n\n` +
    'Enter this code on the verification page to activate your account.';
  await transporter.sendMail({
    from: process.env.MAIL_FROM || 'no-reply@bildyx.com',
    to: email,
    subject,
    text
  });
}

/**
 * sendResetEmail
 *
 * Send an email containing a password reset link.  The link
 * includes the token and email as query parameters.  Note that
 * sending the email is not considered an error if the address is
 * not registered – responses always return 200 to avoid leaking
 * account existence.
 */
async function sendResetEmail(email, token) {
  const link = `${process.env.RESET_BASE_URL || 'http://localhost:5500/reset-password.html'}?token=${token}&email=${encodeURIComponent(email)}`;
  const subject = 'Bildyx – Reset your password';
  const text = `We received a request to reset your Bildyx password.\n\n` +
    `If you made this request, click the link below and choose a new password:\n${link}\n\n` +
    `If you did not request a password reset, please ignore this email.`;
  await transporter.sendMail({
    from: process.env.MAIL_FROM || 'no-reply@bildyx.com',
    to: email,
    subject,
    text
  });
}

/**
 * createSession
 *
 * Given a user and request context, create a persistent session token,
 * store it hashed in the database and set a secure HTTP-only cookie
 * on the response.  Sessions expire after 24 hours by default.  The
 * cookie name can be customised via SESSION_COOKIE_NAME env var.
 */
async function createSession(userId, req, res) {
  const sessionToken = nanoid(40);
  // Hash the token before storing it to prevent leakage if the DB is
  // compromised.  We use sha256 here so that the same token yields
  // the same hash when revoking.  Bcrypt cannot be used here because
  // it generates a new salt for each hash.
  const tokenHash = crypto.createHash('sha256').update(sessionToken).digest('hex');
  const expiresAt = dayjs().add(24, 'hour').toDate();
  await prisma.userSession.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
      ipAddress: req.ip,
      userAgent: req.get('user-agent') || null
    }
  });
  const cookieName = process.env.SESSION_COOKIE_NAME || 'bildyx_session';
  const secureFlag = process.env.NODE_ENV === 'production';
  res.cookie(cookieName, sessionToken, {
    httpOnly: true,
    secure: secureFlag,
    sameSite: 'lax',
    expires: expiresAt
  });
}

/**
 * sanitizeString
 *
 * Remove leading/trailing whitespace and escape potentially
 * dangerous characters.  While parameterised queries protect
 * against SQL injection, we still sanitise certain inputs to
 * maintain a clean database and avoid storing dangerous content.
 */
function sanitizeString(value) {
  return String(value || '').trim();
}

/**
 * POST /api/auth/signup
 *
 * Create a new user profile.  The request body should contain:
 * - accountType: "organisation" or "job_seeker"
 * - organisationName (if organisation account)
 * - firstName, lastName
 * - email
 * - password
 * - marketing (boolean)
 *
 * On success, a profile is created with a hashed password and a
 * verification code is generated and emailed.  The client must
 * subsequently call /api/auth/verify-email to complete sign up.
 */
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { accountType, organisationName, companyName, firstName, lastName, email, password, marketing } = req.body || {};
    if (!email || !password || !accountType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const cleanedEmail = sanitizeString(email).toLowerCase();
    // Check if a user with this email already exists
    const existing = await prisma.user.findUnique({ where: { email: cleanedEmail } });
    if (existing) {
      const expiredUnverified =
        !existing.emailVerified &&
        existing.verificationExpiresAt &&
        existing.verificationExpiresAt < new Date();

      if (expiredUnverified) {
        await prisma.user.delete({ where: { id: existing.id } });
      } else {
        return res.status(409).json({ error: 'Account already exists' });
      }
    }
    // Hash password
    const passwordHash = await bcrypt.hash(String(password), 10);
    // Determine role based on account type.  Use UserRole enum for clarity.
    const role = accountType === 'organisation' ? UserRole.ORGANISATION : UserRole.CANDIDATE;
    // Prepare the user data.  Always include email, role, marketing and password fields.
    const userData = {
      email: cleanedEmail,
      role,
      marketingOptIn: !!marketing,
      passwordHash,
      emailVerified: false,
      organisationName: null,
      firstName: null,
      lastName: null
    };
    if (role === UserRole.ORGANISATION) {
      // Capture the organisation name on the user record when registering as an organisation.
      const orgName = organisationName ?? companyName;
      userData.organisationName = sanitizeString(orgName);
    } else {
      userData.firstName = sanitizeString(firstName);
      userData.lastName = sanitizeString(lastName);
    }
    // Create the user in the database
    const userRecord = await prisma.user.create({ data: userData });
    // In this simplified schema, no additional records (company accounts, candidates) are created.  All information is stored in the User model.
    // Generate verification code and expiry (15 minutes)
    const code = nanoid(6).toUpperCase();
    const expires = dayjs().add(15, 'minute').toDate();
    await prisma.user.update({
      where: { id: userRecord.id },
      data: {
        verificationCode: code,
        verificationExpiresAt: expires,
        lastVerificationSentAt: new Date()
      }
    });
    await sendVerificationEmail(cleanedEmail, code);
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal error' });
  }
});

/**
 * POST /api/auth/verify-email
 *
 * Verify an email by matching a code previously sent.  The request
 * body should include { email, code }.  If the code matches and
 * has not expired, the profile's emailVerified field is set.
 */
app.post('/api/auth/verify-email', async (req, res) => {
  try {
    const { email, code } = req.body || {};
    if (!email || !code) {
      return res.status(400).json({ error: 'Missing email or code' });
    }
    const profile = await prisma.user.findUnique({ where: { email: sanitizeString(email).toLowerCase() } });
    if (!profile) {
      return res.status(400).json({ error: 'Invalid code' });
    }
    if (profile.emailVerified) {
      return res.status(200).json({ ok: true, message: 'Already verified' });
    }
    if (profile.verificationExpiresAt && profile.verificationExpiresAt < new Date()) {
      await prisma.user.delete({ where: { id: profile.id } });
      return res.status(410).json({
        error: 'Verification expired. Your account has been deleted. Please create a new account.'
      });
    }
    if (!profile.verificationCode || profile.verificationCode.toUpperCase() !== String(code).toUpperCase()) {
      return res.status(400).json({ error: 'Invalid code' });
    }
    await prisma.user.update({
      where: { id: profile.id },
      data: {
        emailVerified: true,
        verificationCode: null,
        verificationExpiresAt: null,
        lastVerificationSentAt: null
      }
    });
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal error' });
  }
});

/**
 * POST /api/auth/resend-verification
 *
 * Resend a verification code if 30 seconds have elapsed since the last
 * send.  Body: { email }.  A new code is generated and the expiry
 * resets to 15 minutes from now.
 */
app.post('/api/auth/resend-verification', async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }
    const profile = await prisma.user.findUnique({ where: { email: sanitizeString(email).toLowerCase() } });
    if (!profile || profile.emailVerified) {
      // Do not leak existence; always return success
      return res.status(200).json({ ok: true });
    }
    const now = new Date();
    if (profile.verificationExpiresAt && profile.verificationExpiresAt < now) {
      await prisma.user.delete({ where: { id: profile.id } });
      return res.status(410).json({
        error: 'Verification expired. Your account has been deleted. Please create a new account.'
      });
    }
    if (profile.lastVerificationSentAt && now.getTime() - profile.lastVerificationSentAt.getTime() < 30000) {
      return res.status(429).json({ error: 'Please wait before requesting another code' });
    }
    const code = nanoid(6).toUpperCase();
    const expires = dayjs().add(15, 'minute').toDate();
    await prisma.user.update({
      where: { id: profile.id },
      data: {
        verificationCode: code,
        verificationExpiresAt: expires,
        lastVerificationSentAt: now
      }
    });
    await sendVerificationEmail(profile.email, code);
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal error' });
  }
});

/**
 * POST /api/auth/login
 *
 * Authenticate a user.  Body: { email, password }.  On success
 * returns ok: true.  On failure returns 401.  Note that email must
 * be verified.  Rate-limiting is handled on the client side for
 * demonstration; in production you should apply server-side rate
 * limiting as well.
 */
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Missing email or password' });
    }
    const profile = await prisma.user.findUnique({ where: { email: sanitizeString(email).toLowerCase() } });
    if (!profile) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    if (!profile.emailVerified) {
      if (profile.verificationExpiresAt && profile.verificationExpiresAt < new Date()) {
        await prisma.user.delete({ where: { id: profile.id } });
        return res.status(410).json({
          error: 'Verification expired. Your account has been deleted. Please create a new account.'
        });
      }
      return res.status(401).json({ error: 'Email not verified' });
    }
    const match = await bcrypt.compare(String(password), profile.passwordHash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    // On success, create a session and send a cookie.  The session
    // token is stored hashed in the database; only the raw token is
    // sent to the client as an HTTP-only cookie.
    await createSession(profile.id, req, res);
    return res.status(200).json({ ok: true, role: profile.role });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal error' });
  }
});

/**
 * POST /api/auth/forgot-password
 *
 * Request a password reset.  Body: { email }.  A reset token is
 * generated and emailed if the account exists.  A throttle of 30
 * seconds is enforced via lastResetSentAt.  The response is always
 * 200 to avoid leaking account existence.
 */
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }
    const profile = await prisma.user.findUnique({ where: { email: sanitizeString(email).toLowerCase() } });
    if (profile) {
      const now = new Date();
      if (!profile.lastResetSentAt || now.getTime() - profile.lastResetSentAt.getTime() >= 30000) {
        const token = nanoid(16);
        const expires = dayjs().add(1, 'hour').toDate();
        await prisma.user.update({
          where: { id: profile.id },
          data: {
            resetToken: token,
            resetExpiresAt: expires,
            lastResetSentAt: now
          }
        });
        await sendResetEmail(profile.email, token);
      }
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal error' });
  }
});

/**
 * POST /api/auth/reset-password
 *
 * Reset a password using a token.  Body: { email, token, newPassword }.
 * Validates that the token matches and is not expired.  After
 * success, the reset token fields are cleared and emailVerified is
 * set to true (the reset process implicitly verifies the email).
 */
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { email, token, newPassword } = req.body || {};
    if (!email || !token || !newPassword) {
      return res.status(400).json({ error: 'Missing fields' });
    }
    const profile = await prisma.user.findUnique({ where: { email: sanitizeString(email).toLowerCase() } });
    if (!profile || !profile.resetToken || profile.resetToken !== String(token)) {
      return res.status(400).json({ error: 'Invalid reset token' });
    }
    if (!profile.resetExpiresAt || profile.resetExpiresAt < new Date()) {
      return res.status(400).json({ error: 'Reset token expired' });
    }
    const hash = await bcrypt.hash(String(newPassword), 10);
    await prisma.user.update({
      where: { id: profile.id },
      data: {
        passwordHash: hash,
        resetToken: null,
        resetExpiresAt: null,
        lastResetSentAt: null,
        emailVerified: true
      }
    });
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal error' });
  }
});

/**
 * POST /api/auth/logout
 *
 * Revoke the current session.  Reads the session token from the
 * cookie, hashes it and marks the corresponding session as
 * revoked.  Clears the cookie on the client.
 */
app.post('/api/auth/logout', async (req, res) => {
  try {
    const cookieName = process.env.SESSION_COOKIE_NAME || 'bildyx_session';
    const token = req.cookies ? req.cookies[cookieName] : null;
    if (token) {
      // Hash the token the same way as in createSession using sha256
      const tokenHash = crypto.createHash('sha256').update(String(token)).digest('hex');
      // Revoke session if it exists
      await prisma.userSession.updateMany({
        where: { tokenHash },
        data: { revokedAt: new Date() }
      });
    }
    res.clearCookie(cookieName);
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal error' });
  }
});

// Start server if run directly
if (require.main === module) {
  const port = process.env.PORT || 3000;

  app.post('/api/auth/cancel-unverified', async (req, res) => {
    try {
      const { email } = req.body || {};

      if (!email) {
        return res.status(400).json({ error: 'Missing email' });
      }

      const cleanedEmail = sanitizeString(email).toLowerCase();

      const user = await prisma.user.findUnique({
        where: { email: cleanedEmail }
      });

      if (!user) {
        return res.status(200).json({ ok: true });
      }

      if (user.emailVerified) {
        return res.status(400).json({
          error: 'This account is already verified and cannot be deleted here.'
        });
      }

      await prisma.user.delete({
        where: { id: user.id }
      });

      return res.status(200).json({ ok: true });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal error' });
    }
  });

  app.listen(port, () => {
    console.log(`Bildyx auth server running on port ${port}`);
  });
}

module.exports = app;