import { useMemo } from 'react';
import { useAuth } from '../store/AuthContext.jsx';
import { usePreferences } from '../store/PreferencesContext.jsx';
import { formatMoney, formatDate } from '../utils/format.js';

/** Currency + date formatters bound to the user's settings. */
export default function useFormat() {
  const { user } = useAuth();
  const { dateFormat } = usePreferences();
  const currency = user?.currency || 'PKR';
  return useMemo(
    () => ({
      currency,
      money: (n, opts) => formatMoney(n, currency, opts),
      date: (d) => formatDate(d, dateFormat),
    }),
    [currency, dateFormat]
  );
}
