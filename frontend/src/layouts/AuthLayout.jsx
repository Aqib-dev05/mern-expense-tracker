import { Outlet } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import Logo from '../components/Logo.jsx';
import { usePreferences } from '../store/PreferencesContext.jsx';

export default function AuthLayout() {
  const { theme, toggleTheme } = usePreferences();
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <button
        onClick={toggleTheme}
        aria-label="Toggle theme"
        className="absolute right-4 top-4 rounded-xl p-2.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-ink-800"
      >
        {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </button>
      <Logo className="mb-8" />
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-card dark:border-ink-800 dark:bg-ink-900 sm:p-8">
        <Outlet />
      </div>
    </div>
  );
}
