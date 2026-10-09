import { ChevronLeft, ChevronRight } from 'lucide-react';

function pageList(page, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const set = new Set([1, total, page - 1, page, page + 1]);
  const nums = [...set].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
  const out = [];
  nums.forEach((n, i) => {
    if (i && n - nums[i - 1] > 1) out.push('gap-' + n);
    out.push(n);
  });
  return out;
}

const btn =
  'inline-flex h-10 min-w-10 items-center justify-center rounded-xl px-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40';

export default function Pagination({ page, totalPages, total, limit, onChange }) {
  if (totalPages <= 1) return null;
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <nav aria-label="Pagination" className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Showing <span className="font-semibold text-slate-700 dark:text-slate-200">{from}–{to}</span> of{' '}
        <span className="font-semibold text-slate-700 dark:text-slate-200">{total}</span>
      </p>

      {/* Phones: compact prev / page x of y / next */}
      <div className="flex w-full items-center justify-between gap-2 sm:hidden">
        <button className={`${btn} border border-slate-300 dark:border-ink-700`} disabled={page <= 1} onClick={() => onChange(page - 1)}>
          <ChevronLeft className="mr-1 h-4 w-4" /> Prev
        </button>
        <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Page {page} of {totalPages}</span>
        <button className={`${btn} border border-slate-300 dark:border-ink-700`} disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
          Next <ChevronRight className="ml-1 h-4 w-4" />
        </button>
      </div>

      {/* sm+: numbered */}
      <div className="hidden items-center gap-1 sm:flex">
        <button className={`${btn} text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-ink-800`} disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Previous page">
          <ChevronLeft className="h-4 w-4" />
        </button>
        {pageList(page, totalPages).map((p) =>
          typeof p === 'string' ? (
            <span key={p} className="px-1 text-slate-400">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onChange(p)}
              aria-current={p === page ? 'page' : undefined}
              className={`${btn} ${p === page ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-ink-800'}`}
            >
              {p}
            </button>
          )
        )}
        <button className={`${btn} text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-ink-800`} disabled={page >= totalPages} onClick={() => onChange(page + 1)} aria-label="Next page">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </nav>
  );
}
