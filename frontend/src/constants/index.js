export const EXPENSE_CATEGORIES = [
  'Food', 'Transport', 'Shopping', 'Bills', 'Health', 'Education',
  'Entertainment', 'Travel', 'Rent', 'Subscriptions', 'Other',
];
export const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Business', 'Investment', 'Gift', 'Other'];
export const ALL_CATEGORIES = [...new Set([...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES])];
export const PAYMENT_METHODS = ['Cash', 'Bank', 'Credit Card', 'Debit Card', 'JazzCash', 'Easypaisa', 'Other'];

export const CURRENCIES = [
  { code: 'PKR', label: 'Pakistani Rupee (Rs.)' },
  { code: 'USD', label: 'US Dollar ($)' },
  { code: 'EUR', label: 'Euro (€)' },
  { code: 'GBP', label: 'British Pound (£)' },
  { code: 'INR', label: 'Indian Rupee (₹)' },
  { code: 'AED', label: 'UAE Dirham (AED)' },
  { code: 'SAR', label: 'Saudi Riyal (SAR)' },
];

export const DATE_FORMATS = [
  { value: 'short', label: 'Oct 08, 2026' },
  { value: 'dmy', label: '08/10/2026 (DD/MM/YYYY)' },
  { value: 'mdy', label: '10/08/2026 (MM/DD/YYYY)' },
  { value: 'iso', label: '2026-10-08 (ISO)' },
];

export const RANGE_OPTIONS = [
  { value: 'this_month', label: 'This month' },
  { value: 'last_month', label: 'Last month' },
  { value: 'last_6_months', label: 'Last 6 months' },
  { value: 'this_year', label: 'This year' },
  { value: 'custom', label: 'Custom range' },
];

export const BUDGET_PERIODS = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'custom', label: 'Custom dates' },
];

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'highest', label: 'Highest amount' },
  { value: 'lowest', label: 'Lowest amount' },
];

// Distinct colour + emoji per category, used for tiles, charts and chips.
export const CATEGORY_META = {
  Food: { emoji: '🍔', color: '#f97316' },
  Transport: { emoji: '🚗', color: '#0ea5e9' },
  Shopping: { emoji: '🛍️', color: '#ec4899' },
  Bills: { emoji: '🧾', color: '#eab308' },
  Health: { emoji: '💊', color: '#ef4444' },
  Education: { emoji: '🎓', color: '#6366f1' },
  Entertainment: { emoji: '🎬', color: '#a855f7' },
  Travel: { emoji: '✈️', color: '#14b8a6' },
  Rent: { emoji: '🏠', color: '#64748b' },
  Subscriptions: { emoji: '🔁', color: '#8b5cf6' },
  Other: { emoji: '📦', color: '#94a3b8' },
  Salary: { emoji: '💼', color: '#10b981' },
  Freelance: { emoji: '💻', color: '#06b6d4' },
  Business: { emoji: '🏪', color: '#84cc16' },
  Investment: { emoji: '📈', color: '#22c55e' },
  Gift: { emoji: '🎁', color: '#f43f5e' },
};
export const categoryMeta = (c) => CATEGORY_META[c] || CATEGORY_META.Other;
