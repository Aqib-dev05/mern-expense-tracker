import { Router } from 'express';
import crypto from 'node:crypto';
import mongoose from 'mongoose';
import nodemailer from 'nodemailer';
import { z } from 'zod';
import * as c from '../controllers/authController.js';
import env from '../config/env.js';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { authLimiter } from '../middleware/rateLimit.js';
import { registerSchema, loginSchema, updateProfileSchema } from '../validators/schemas.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = Router();
router.post('/register', authLimiter, validate(registerSchema), c.register);
router.post('/login', authLimiter, validate(loginSchema), c.login);
router.post('/logout', c.logout);
router.get('/me', authenticate, c.me);
router.patch('/me', authenticate, validate(updateProfileSchema), c.updateMe);

/* ===================== Forgot password (email OTP) ===================== */
const OTP_TTL_MS = 10 * 60 * 1000; // a code is valid for 10 minutes
const RESEND_COOLDOWN_MS = 60 * 1000; // at most one email per minute per account
const MAX_ATTEMPTS = 5; // wrong guesses allowed per code

// One pending reset per email. Only a keyed hash of the code is stored, never the code itself.
const PasswordReset =
  mongoose.models.PasswordReset ||
  mongoose.model(
    'PasswordReset',
    new mongoose.Schema({
      email: { type: String, required: true, unique: true, lowercase: true, trim: true },
      otpHash: { type: String, required: true },
      attempts: { type: Number, default: 0 },
      lastSentAt: { type: Date, default: Date.now },
      expiresAt: { type: Date, required: true, index: { expires: 0 } }, // Mongo TTL index removes expired docs
    })
  );

const emailField = z.string().trim().toLowerCase().email('Enter a valid email address').max(254);
const forgotPasswordSchema = z.object({ email: emailField });
const resetPasswordSchema = z.object({
  email: emailField,
  otp: z.string().trim().regex(/^\d{6}$/, 'Enter the 6-digit code'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(72, 'Password is too long'),
});

const SMTP_PORT = Number(process.env.SMTP_PORT) || 465;
const mailConfigured = Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
let transporter;
const getMailer = () =>
  (transporter ||= nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  }));

const hashOtp = (email, otp) => crypto.createHmac('sha256', env.jwtSecret).update(`${email}:${otp}`).digest('hex');
const escapeHtml = (s = '') => String(s).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);

async function sendResetEmail(user, otp) {
  if (!mailConfigured) {
    // Local development without SMTP: print the code instead of emailing it.
    if (!env.isProd) console.log(`[dev] password reset code for ${user.email}: ${otp}`);
    return;
  }
  await getMailer().sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to: user.email,
    subject: 'Your password reset code',
    text: `Hi ${user.name},\n\nYour password reset code is ${otp}. It expires in 10 minutes.\n\nIf you did not request this, you can ignore this email.`,
    html: `<p>Hi ${escapeHtml(user.name)},</p><p>Your password reset code is:</p>
      <p style="font-size:28px;font-weight:800;letter-spacing:6px">${otp}</p>
      <p>It expires in 10 minutes. If you did not request this, you can ignore this email.</p>`,
  });
}

// POST /api/auth/forgot-password  { email }
router.post(
  '/forgot-password',
  authLimiter,
  validate(forgotPasswordSchema),
  asyncHandler(async (req, res) => {
    const { email } = req.body;
    // Same answer whether or not the email is registered, so accounts can't be enumerated.
    const generic = { message: 'If this email is registered, a 6-digit code has been sent.' };

    if (env.isProd && !mailConfigured) throw new ApiError(500, 'Email service is not configured');

    const user = await User.findOne({ email });
    if (!user) return res.json(generic);

    const existing = await PasswordReset.findOne({ email }).select('lastSentAt');
    if (existing && Date.now() - existing.lastSentAt.getTime() < RESEND_COOLDOWN_MS) return res.json(generic);

    const otp = String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');
    await PasswordReset.findOneAndUpdate(
      { email },
      { otpHash: hashOtp(email, otp), attempts: 0, lastSentAt: new Date(), expiresAt: new Date(Date.now() + OTP_TTL_MS) },
      { upsert: true, setDefaultsOnInsert: true }
    );

    // Sent in the background so response time doesn't reveal whether the account exists.
    // (On a serverless host that freezes after the response, `await` this call instead.)
    sendResetEmail(user, otp).catch((err) => console.error('Failed to send reset email:', err.message));
    res.json(generic);
  })
);

// POST /api/auth/reset-password  { email, otp, password }
router.post(
  '/reset-password',
  authLimiter,
  validate(resetPasswordSchema),
  asyncHandler(async (req, res) => {
    const { email, otp, password } = req.body;
    const invalid = () =>
      new ApiError(400, 'Invalid or expired code. Please request a new one.', [{ field: 'otp', message: 'Invalid or expired code' }]);

    // Count the attempt atomically *before* comparing, so parallel guesses can't beat the limit.
    const record = await PasswordReset.findOneAndUpdate(
      { email, expiresAt: { $gt: new Date() }, attempts: { $lt: MAX_ATTEMPTS } },
      { $inc: { attempts: 1 } },
      { new: true }
    );
    if (!record) throw invalid();

    const expected = Buffer.from(record.otpHash, 'hex');
    const actual = Buffer.from(hashOtp(email, otp), 'hex');
    if (expected.length !== actual.length || !crypto.timingSafeEqual(expected, actual)) throw invalid();

    const user = await User.findOne({ email });
    if (!user) throw invalid();

    user.password = password; // the User model's pre-save hook hashes it
    await user.save();
    await PasswordReset.deleteOne({ email }); // a code works only once

    res.json({ message: 'Password updated. You can now log in.' });
  })
);

export default router;
