const colors = { ok: 'bg-emerald-500', warning: 'bg-amber-500', exceeded: 'bg-rose-500' };

export default function ProgressBar({ percentage, status = 'ok', label }) {
  return (
    <div
      className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-ink-800"
      role="progressbar"
      aria-valuenow={Math.min(100, Math.round(percentage))}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div className={`h-full rounded-full transition-[width] duration-500 ${colors[status]}`} style={{ width: `${Math.min(100, percentage)}%` }} />
    </div>
  );
}
