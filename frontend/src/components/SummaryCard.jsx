import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import Card from './ui/Card.jsx';
import { percent } from '../utils/format.js';

const tones = {
  brand: 'bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300',
  income: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300',
  expense: 'bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300',
  savings: 'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300',
};

/**
 * change: percentage vs previous period (null = no baseline). `lowerIsBetter` flips the colour (expenses).
 */
export default function SummaryCard({ title, value, icon: Icon, tone = 'brand', change, lowerIsBetter = false, footnote, comparisonLabel = 'vs last month' }) {
  let delta = null;
  if (change !== undefined) {
    if (change === null) delta = <span className="text-xs text-slate-500 dark:text-slate-400">No data last month</span>;
    else if (change === 0) {
      delta = (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <Minus className="h-3.5 w-3.5" /> No change <span className="font-normal">{comparisonLabel}</span>
        </span>
      );
    } else {
      const up = change > 0;
      const good = lowerIsBetter ? !up : up;
      const Arrow = up ? ArrowUpRight : ArrowDownRight;
      delta = (
        <span className={`inline-flex items-center gap-1 text-xs font-semibold ${good ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
          <Arrow className="h-3.5 w-3.5" /> {percent(change)}
          <span className="font-normal text-slate-500 dark:text-slate-400">{comparisonLabel}</span>
        </span>
      );
    }
  }

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{title}</p>
        <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${tones[tone]}`}>
          <Icon className="h-[18px] w-[18px]" />
        </span>
      </div>
      <p className="truncate text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-[1.65rem]">{value}</p>
      <div className="min-h-[1rem]">{delta ?? <span className="text-xs text-slate-500 dark:text-slate-400">{footnote}</span>}</div>
      {delta && footnote && <p className="-mt-1 text-xs text-slate-500 dark:text-slate-400">{footnote}</p>}
    </Card>
  );
}
