import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  BarChart3, FileText, LayoutDashboard, LogOut, Menu, Moon, PiggyBank, Plus, Receipt, Settings, Sun, X,
} from 'lucide-react';
import Logo from '../components/Logo.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import Button from '../components/ui/Button.jsx';
import { AppDataProvider, useAppData } from '../store/AppDataContext.jsx';
import { useAuth } from '../store/AuthContext.jsx';
import { usePreferences } from '../store/PreferencesContext.jsx';

const MAIN_NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/transactions', label: 'Transactions', icon: Receipt },
  { to: '/budgets', label: 'Budgets', icon: PiggyBank },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/reports', label: 'Reports', icon: FileText },
];

const linkCls = ({ isActive }) =>
  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
    isActive
      ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-200'
      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-ink-800'
  }`;

function NavList({ onNavigate }) {
  return (
    <nav className="flex flex-1 flex-col gap-1" aria-label="Main">
      {MAIN_NAV.map(({ to, label, icon: Icon, end }) => (
        <NavLink key={to} to={to} end={end} className={linkCls} onClick={onNavigate}>
          <Icon className="h-[18px] w-[18px]" /> {label}
        </NavLink>
      ))}
      <div className="mt-auto flex flex-col gap-1 border-t border-slate-100 pt-3 dark:border-ink-800">
        <NavLink to="/settings" className={linkCls} onClick={onNavigate}>
          <Settings className="h-[18px] w-[18px]" /> Settings
        </NavLink>
      </div>
    </nav>
  );
}

function UserBlock() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = usePreferences();
  return (
    <div className="mt-3 flex items-center gap-3 rounded-xl bg-slate-50 p-3 dark:bg-ink-800/60">
      <Avatar user={user} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{user.name}</p>
        <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
      </div>
      <button onClick={toggleTheme} aria-label="Toggle theme" className="rounded-lg p-2 text-slate-500 hover:bg-slate-200/60 dark:text-slate-400 dark:hover:bg-ink-700">
        {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>
      <button onClick={logout} aria-label="Log out" className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:text-slate-400 dark:hover:bg-rose-500/10">
        <LogOut className="h-4 w-4" />
      </button>
    </div>
  );
}

function Shell() {
  const [drawer, setDrawer] = useState(false);
  const { openTransactionForm } = useAppData();
  const { logout } = useAuth();
  const location = useLocation();

  useEffect(() => { setDrawer(false); window.scrollTo(0, 0); }, [location.pathname]);
  useEffect(() => {
    document.body.style.overflow = drawer ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawer]);

  const tab = (isActive) =>
    `flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[11px] font-semibold ${
      isActive ? 'text-brand-600 dark:text-brand-300' : 'text-slate-500 dark:text-slate-400'
    }`;

  return (
    <div className="min-h-dvh">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200 bg-white px-4 py-5 dark:border-ink-800 dark:bg-ink-900 lg:flex">
        <Logo className="mb-6 px-1" />
        <Button className="mb-5 w-full" onClick={() => openTransactionForm()}>
          <Plus className="h-4 w-4" /> Add transaction
        </Button>
        <NavList />
        <UserBlock />
      </aside>

      {/* Mobile / tablet top bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur dark:border-ink-800 dark:bg-ink-900/90 lg:hidden">
        <button onClick={() => setDrawer(true)} aria-label="Open menu" className="-ml-2 rounded-xl p-2.5 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-ink-800">
          <Menu className="h-5 w-5" />
        </button>
        <Logo />
        <span className="w-10" />
      </header>

      {/* Mobile drawer */}
      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
          <div className="absolute inset-0 bg-slate-950/50" onClick={() => setDrawer(false)} aria-hidden />
          <div className="absolute inset-y-0 left-0 flex w-[19rem] max-w-[85vw] flex-col bg-white px-4 pb-5 pt-4 shadow-xl dark:bg-ink-900">
            <div className="mb-5 flex items-center justify-between">
              <Logo />
              <button onClick={() => setDrawer(false)} aria-label="Close menu" className="rounded-xl p-2.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-ink-800">
                <X className="h-5 w-5" />
              </button>
            </div>
            <NavList onNavigate={() => setDrawer(false)} />
            <UserBlock />
            <Button variant="secondary" className="mt-3 w-full" onClick={logout}><LogOut className="h-4 w-4" /> Log out</Button>
          </div>
        </div>
      )}

      <main className="lg:pl-64">
        <div className="mx-auto max-w-7xl px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-10 lg:pt-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom navigation with a centred primary action */}
      <nav className="pb-safe fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur dark:border-ink-800 dark:bg-ink-900/95 lg:hidden" aria-label="Quick navigation">
        <div className="mx-auto flex max-w-lg items-end px-2">
          <NavLink to="/" end className={({ isActive }) => tab(isActive)}><LayoutDashboard className="h-5 w-5" />Home</NavLink>
          <NavLink to="/transactions" className={({ isActive }) => tab(isActive)}><Receipt className="h-5 w-5" />Activity</NavLink>
          <div className="flex flex-1 justify-center">
            <button
              onClick={() => openTransactionForm()}
              aria-label="Add transaction"
              className="-mt-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-lg shadow-brand-600/30 active:scale-95"
            >
              <Plus className="h-6 w-6" />
            </button>
          </div>
          <NavLink to="/budgets" className={({ isActive }) => tab(isActive)}><PiggyBank className="h-5 w-5" />Budgets</NavLink>
          <NavLink to="/analytics" className={({ isActive }) => tab(isActive)}><BarChart3 className="h-5 w-5" />Analytics</NavLink>
        </div>
      </nav>
    </div>
  );
}

export default function AppLayout() {
  return (
    <AppDataProvider>
      <Shell />
    </AppDataProvider>
  );
}
