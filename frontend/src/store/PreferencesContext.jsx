import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const PreferencesContext = createContext(null);
const THEME_KEY = 'et_theme';
const DATE_KEY = 'et_date_format';

const read = (key, fallback) => {
  try { return localStorage.getItem(key) || fallback; } catch { return fallback; }
};
const initialTheme = () =>
  read(THEME_KEY, window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

export function PreferencesProvider({ children }) {
  const [theme, setThemeState] = useState(initialTheme);
  const [dateFormat, setDateFormatState] = useState(() => read(DATE_KEY, 'short'));

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const setTheme = useCallback((t) => {
    setThemeState(t);
    try { localStorage.setItem(THEME_KEY, t); } catch { /* storage unavailable */ }
  }, []);
  const setDateFormat = useCallback((f) => {
    setDateFormatState(f);
    try { localStorage.setItem(DATE_KEY, f); } catch { /* storage unavailable */ }
  }, []);

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme: () => setTheme(theme === 'dark' ? 'light' : 'dark'), dateFormat, setDateFormat }),
    [theme, setTheme, dateFormat, setDateFormat]
  );
  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export const usePreferences = () => useContext(PreferencesContext);
