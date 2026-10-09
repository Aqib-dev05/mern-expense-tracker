import { Pencil, Trash2, AlertTriangle, CheckCircle2, AlertOctagon } from 'lucide-react';
import Card from './ui/Card.jsx';
import Badge from './ui/Badge.jsx';
import ProgressBar from './ui/ProgressBar.jsx';
import CategoryIcon from './CategoryIcon.jsx';
import useFormat from '../hooks/useFormat.js';

const STATUS = {
  ok: { tone: 'income', label: 'On track', icon: CheckCircle2 },
  warning: { tone: 'warning', label: 'Nearing limit', icon: AlertTriangle },
  exceeded: { tone: 'expense', label: 'Exceeded', icon: AlertOctagon },
};

export default function BudgetCard({ budget, onEdit, onDelete }) {
  const fmt = useFormat();
  const s = STATUS[budget.status];
  const Icon = s.icon;
  const over = budget.remaining < 0;

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <CategoryIcon category={budget.category} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold text-slate-900 dark:text-white">{budget.category}</p>
          <p className="text-xs capitalize text-slate-500 dark:text-slate-400">
            {budget.period} · {fmt.date(budget.startDate)} – {fmt.date(budget.endDate)}
          </p>
        </div>
        <Badge tone={s.tone}><Icon className="h-3 w-3" /> {s.label}</Badge>
      </div>

      <div>
        <div className="mb-2 flex items-baseline justify-between gap-2">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            <span className="text-lg font-extrabold text-slate-900 dark:text-white">{fmt.money(budget.spent)}</span>
            {' '}of {fmt.money(budget.amount)}
          </p>
          <span className={`text-sm font-bold ${budget.status === 'exceeded' ? 'text-rose-600 dark:text-rose-400' : budget.status === 'warning' ? 'text-amber-600 dark:text-amber-400' : 'text-slate-700 dark:text-slate-200'}`}>
            {Math.round(budget.percentage)}%
          </span>
        </div>
        <ProgressBar percentage={budget.percentage} status={budget.status} label={`${budget.category} budget used`} />
        <p className={`mt-2 text-xs font-medium ${over ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400'}`}>
          {over ? `Over budget by ${fmt.money(-budget.remaining)}` : `${fmt.money(budget.remaining)} remaining`}
        </p>
      </div>

      {(onEdit || onDelete) && (
        <div className="-mb-1 flex justify-end gap-1 border-t border-slate-100 pt-3 dark:border-ink-800">
          {onEdit && (
            <button onClick={() => onEdit(budget)} className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-ink-800">
              <Pencil className="h-4 w-4" /> Edit
            </button>
          )}
          {onDelete && (
            <button onClick={() => onDelete(budget)} className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10">
              <Trash2 className="h-4 w-4" /> Delete
            </button>
          )}
        </div>
      )}
    </Card>
  );
}
