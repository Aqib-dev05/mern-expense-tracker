import ApiError from './ApiError.js';

/**
 * All dates are handled as UTC calendar days ("YYYY-MM-DD" -> UTC midnight).
 * Ranges are half-open: [start, end).
 */
export const DAY = 86_400_000;

export const parseDateOnly = (s) => {
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const d = new Date(`${s}T00:00:00.000Z`);
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== s) return null;
  return d;
};

export const toDateKey = (d) => d.toISOString().slice(0, 10);
export const addDays = (d, n) => new Date(d.getTime() + n * DAY);

export const addMonths = (d, n) => {
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth() + n;
  const lastDay = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  return new Date(Date.UTC(y, m, Math.min(d.getUTCDate(), lastDay)));
};

export const startOfMonth = (d) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
export const todayUTC = (now = new Date()) =>
  new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

export function resolveRange({ range = 'this_month', startDate, endDate } = {}, now = new Date()) {
  const som = startOfMonth(todayUTC(now));
  switch (range) {
    case 'this_month':
      return { start: som, end: addMonths(som, 1) };
    case 'last_month':
      return { start: addMonths(som, -1), end: som };
    case 'last_6_months':
      return { start: addMonths(som, -5), end: addMonths(som, 1) };
    case 'this_year': {
      const jan1 = new Date(Date.UTC(som.getUTCFullYear(), 0, 1));
      return { start: jan1, end: addMonths(jan1, 12) };
    }
    case 'custom': {
      const s = parseDateOnly(startDate);
      const e = parseDateOnly(endDate);
      if (!s || !e) throw new ApiError(400, 'Valid startDate and endDate (YYYY-MM-DD) are required');
      if (e < s) throw new ApiError(400, 'endDate must be on or after startDate');
      if ((e - s) / DAY > 366 * 5) throw new ApiError(400, 'Date range cannot exceed 5 years');
      return { start: s, end: addDays(e, 1) };
    }
    default:
      throw new ApiError(400, 'Invalid range');
  }
}

const monthsBetween = (start, end) => {
  if (start.getUTCDate() !== 1 || end.getUTCDate() !== 1) return null;
  const n = (end.getUTCFullYear() - start.getUTCFullYear()) * 12 + (end.getUTCMonth() - start.getUTCMonth());
  return n > 0 ? n : null;
};

/** The period immediately before `range`, used for "vs previous period" comparisons. */
export function previousRange({ start, end }) {
  const months = monthsBetween(start, end);
  if (months) return { start: addMonths(start, -months), end: start };
  return { start: new Date(start.getTime() - (end - start)), end: start };
}
