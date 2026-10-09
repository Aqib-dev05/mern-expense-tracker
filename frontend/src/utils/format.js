const SYMBOLS = { PKR: 'Rs. ', USD: '$', EUR: '€', GBP: '£', INR: '₹', AED: 'AED ', SAR: 'SAR ' };
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const pad = (n) => String(n).padStart(2, '0');

export function formatMoney(amount, currency = 'PKR', { sign = false } = {}) {
  const n = Number(amount) || 0;
  const abs = Math.abs(n);
  const digits = Number.isInteger(Math.round(abs * 100) / 100) && Math.round(abs * 100) % 100 === 0 ? 0 : 2;
  const num = new Intl.NumberFormat('en-US', { minimumFractionDigits: digits, maximumFractionDigits: 2 }).format(abs);
  const prefix = n < 0 ? '-' : sign && n > 0 ? '+' : '';
  return `${prefix}${SYMBOLS[currency] ?? `${currency} `}${num}`;
}

export const formatCompact = (n) =>
  new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(Number(n) || 0);

/** Dates from the API are UTC-midnight calendar days, so always read them in UTC. */
export function formatDate(value, fmt = 'short') {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const y = d.getUTCFullYear(), m = d.getUTCMonth(), day = d.getUTCDate();
  switch (fmt) {
    case 'dmy': return `${pad(day)}/${pad(m + 1)}/${y}`;
    case 'mdy': return `${pad(m + 1)}/${pad(day)}/${y}`;
    case 'iso': return `${y}-${pad(m + 1)}-${pad(day)}`;
    default: return `${MONTHS[m]} ${pad(day)}, ${y}`;
  }
}

/** Chart axis labels for backend bucket keys: '2026-10' -> "Oct '26", '2026-10-08' -> 'Oct 8'. */
export function formatBucketKey(key) {
  const [y, m, d] = key.split('-').map(Number);
  return d ? `${MONTHS[m - 1]} ${d}` : `${MONTHS[m - 1]} '${String(y).slice(2)}`;
}

/** Local calendar date as YYYY-MM-DD for <input type="date">. */
export const toDateInput = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const percent = (n) => `${Math.abs(n).toFixed(Math.abs(n) % 1 === 0 ? 0 : 1)}%`;
