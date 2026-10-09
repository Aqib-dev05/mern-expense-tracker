import rateLimit from 'express-rate-limit';

const base = { standardHeaders: true, legacyHeaders: false };

export const apiLimiter = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  limit: 1000,
  message: { message: 'Too many requests. Please slow down.' },
});

export const authLimiter = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  limit: 20,
  message: { message: 'Too many attempts. Please try again in 15 minutes.' },
});
