export default function Logo({ className = '' }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M4 17l5-6 4 4 7-9" />
        </svg>
      </span>
      <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">Ledgerly</span>
    </span>
  );
}
