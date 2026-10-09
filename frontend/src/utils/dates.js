import { toDateInput } from './format.js';

/** Local-time presets (YYYY-MM-DD) for range pickers that send explicit dates. */
export function getPresetRange(key, now = new Date()) {
  const y = now.getFullYear(), m = now.getMonth();
  switch (key) {
    case 'last_month': return { startDate: toDateInput(new Date(y, m - 1, 1)), endDate: toDateInput(new Date(y, m, 0)) };
    case 'last_6_months': return { startDate: toDateInput(new Date(y, m - 5, 1)), endDate: toDateInput(new Date(y, m + 1, 0)) };
    case 'this_year': return { startDate: toDateInput(new Date(y, 0, 1)), endDate: toDateInput(new Date(y, 11, 31)) };
    default: return { startDate: toDateInput(new Date(y, m, 1)), endDate: toDateInput(new Date(y, m + 1, 0)) };
  }
}
