import { z } from 'zod';
import {
  EXPENSE_CATEGORIES, INCOME_CATEGORIES, PAYMENT_METHODS, TRANSACTION_TYPES,
  BUDGET_PERIODS, CURRENCIES, RANGE_PRESETS, MAX_AMOUNT,
} from '../utils/constants.js';
import { parseDateOnly } from '../utils/dates.js';
import { hasValidPrecision } from '../utils/money.js';

const dateStr = z
  .string({ required_error: 'Date is required', invalid_type_error: 'Date must be a string' })
  .refine((v) => parseDateOnly(v) !== null, 'Date must be a valid YYYY-MM-DD date');

const amountField = z.preprocess(
  (v) => (typeof v === 'string' && v.trim() !== '' ? Number(v) : v),
  z
    .number({ required_error: 'Amount is required', invalid_type_error: 'Amount must be a number' })
    .positive('Amount must be greater than 0')
    .max(MAX_AMOUNT, 'Amount is too large')
    .refine(hasValidPrecision, 'Amount can have at most 2 decimal places')
);

const emailField = z.string().trim().toLowerCase().email('Enter a valid email address').max(254);

/* ------------------------------ auth ------------------------------ */
export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(60),
  email: emailField,
  password: z.string().min(8, 'Password must be at least 8 characters').max(72, 'Password is too long'),
  currency: z.enum(CURRENCIES).optional(),
});

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, 'Password is required').max(72),
});

const avatarField = z
  .string()
  .max(100000, 'Avatar image is too large')
  .refine(
    (v) => v === '' || /^https:\/\//.test(v) || /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(v),
    'Avatar must be an https URL or a PNG/JPEG/WebP image'
  );

export const updateProfileSchema = z
  .object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').max(60),
    email: emailField,
    avatar: avatarField,
    currency: z.enum(CURRENCIES),
  })
  .partial()
  .refine((o) => Object.keys(o).length > 0, 'Provide at least one field to update');

/* --------------------------- transactions -------------------------- */
const transactionShape = {
  type: z.enum(TRANSACTION_TYPES, { errorMap: () => ({ message: 'Type must be income or expense' }) }),
  amount: amountField,
  category: z.string({ required_error: 'Category is required' }).trim().min(1, 'Category is required').max(50),
  description: z.string().trim().max(200, 'Description is too long').optional(),
  paymentMethod: z.enum(PAYMENT_METHODS, { errorMap: () => ({ message: 'Invalid payment method' }) }).optional(),
  date: dateStr,
  notes: z.string().trim().max(1000, 'Notes are too long').optional(),
};

export const categoriesFor = (type) => (type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES);

export const createTransactionSchema = z
  .object(transactionShape)
  .superRefine((d, ctx) => {
    if (!categoriesFor(d.type).includes(d.category)) {
      ctx.addIssue({ code: 'custom', path: ['category'], message: `Invalid category for ${d.type}` });
    }
  })
  .transform((d) => ({ description: '', notes: '', paymentMethod: 'Cash', ...stripUndefined(d) }));

export const updateTransactionSchema = z
  .object(transactionShape)
  .partial()
  .refine((o) => Object.keys(o).length > 0, 'Provide at least one field to update');

function stripUndefined(obj) {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));
}

export const listTransactionsQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    search: z.string().trim().max(100).optional(),
    type: z.enum(TRANSACTION_TYPES).optional(),
    category: z.string().trim().max(50).optional(),
    paymentMethod: z.enum(PAYMENT_METHODS).optional(),
    startDate: dateStr.optional(),
    endDate: dateStr.optional(),
    sort: z.enum(['newest', 'oldest', 'highest', 'lowest']).default('newest'),
  })
  .refine((q) => !q.startDate || !q.endDate || q.startDate <= q.endDate, {
    message: 'startDate must be on or before endDate',
    path: ['startDate'],
  });

/* ------------------------------ budgets ---------------------------- */
const budgetShape = {
  category: z.enum(EXPENSE_CATEGORIES, { errorMap: () => ({ message: 'Choose a valid expense category' }) }),
  amount: amountField,
  period: z.enum(BUDGET_PERIODS, { errorMap: () => ({ message: 'Invalid budget period' }) }),
  startDate: dateStr.optional(),
  endDate: dateStr.optional(),
};

export const createBudgetSchema = z.object(budgetShape).superRefine((d, ctx) => {
  if (d.period === 'custom') {
    if (!d.startDate) ctx.addIssue({ code: 'custom', path: ['startDate'], message: 'Start date is required for a custom period' });
    if (!d.endDate) ctx.addIssue({ code: 'custom', path: ['endDate'], message: 'End date is required for a custom period' });
  }
  if (d.startDate && d.endDate && d.period === 'custom' && d.endDate < d.startDate) {
    ctx.addIssue({ code: 'custom', path: ['endDate'], message: 'End date must be on or after the start date' });
  }
});

export const updateBudgetSchema = z
  .object(budgetShape)
  .partial()
  .refine((o) => Object.keys(o).length > 0, 'Provide at least one field to update');

export const listBudgetsQuerySchema = z.object({
  active: z.enum(['true', 'false']).optional(),
});

/* ----------------------- analytics & reports ----------------------- */
export const rangeQuerySchema = z.object({
  range: z.enum(RANGE_PRESETS).default('this_month'),
  startDate: dateStr.optional(),
  endDate: dateStr.optional(),
});

export const categoriesQuerySchema = rangeQuerySchema.extend({
  type: z.enum(TRANSACTION_TYPES).default('expense'),
});

export const reportQuerySchema = z.object({
  startDate: dateStr,
  endDate: dateStr,
});
