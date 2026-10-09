import { Eye, Pencil, Trash2 } from 'lucide-react';
import Table from './ui/Table.jsx';
import Badge from './ui/Badge.jsx';
import CategoryIcon from './CategoryIcon.jsx';
import useFormat from '../hooks/useFormat.js';

const iconBtn =
  'rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-ink-700 dark:hover:text-white';

function Amount({ tx, fmt, className = '' }) {
  const income = tx.type === 'income';
  return (
    <span className={`font-bold ${income ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'} ${className}`}>
      {fmt.money(income ? tx.amount : -tx.amount, { sign: true })}
    </span>
  );
}

/** Table on md+, tappable cards below. `compact` hides actions (used on the dashboard). */
export default function TransactionList({ transactions, onView, onEdit, onDelete, compact = false }) {
  const fmt = useFormat();

  const columns = [
    { key: 'date', header: 'Date', className: 'w-[8.5rem]', cellClassName: 'whitespace-nowrap text-slate-600 dark:text-slate-300', render: (t) => fmt.date(t.date) },
    {
      key: 'description', header: 'Description',
      render: (t) => (
        <div className="flex items-center gap-3">
          <CategoryIcon category={t.category} size="sm" />
          <span className="truncate font-semibold text-slate-900 dark:text-slate-100">{t.description || t.category}</span>
        </div>
      ),
    },
    { key: 'category', header: 'Category', className: 'w-36', cellClassName: 'truncate text-slate-600 dark:text-slate-300', render: (t) => t.category },
    { key: 'payment', header: 'Payment', className: 'hidden w-32 xl:table-cell', cellClassName: 'truncate text-slate-600 dark:text-slate-300', render: (t) => t.paymentMethod },
    { key: 'type', header: 'Type', className: 'hidden w-28 lg:table-cell', render: (t) => <Badge tone={t.type === 'income' ? 'income' : 'expense'}>{t.type === 'income' ? 'Income' : 'Expense'}</Badge> },
    { key: 'amount', header: 'Amount', className: 'w-32 text-right', cellClassName: 'whitespace-nowrap text-right', render: (t) => <Amount tx={t} fmt={fmt} /> },
  ];
  if (!compact) {
    columns.push({
      key: 'actions', header: <span className="sr-only">Actions</span>, className: 'w-[8.5rem]',
      render: (t) => (
        <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
          <button className={iconBtn} aria-label="View transaction" onClick={() => onView(t)}><Eye className="h-4 w-4" /></button>
          <button className={iconBtn} aria-label="Edit transaction" onClick={() => onEdit(t)}><Pencil className="h-4 w-4" /></button>
          <button className={`${iconBtn} hover:!text-rose-600`} aria-label="Delete transaction" onClick={() => onDelete(t)}><Trash2 className="h-4 w-4" /></button>
        </div>
      ),
    });
  }

  return (
    <>
      <div className="hidden md:block">
        <Table columns={columns} rows={transactions} onRowClick={onView} />
      </div>

      <ul className="divide-y divide-slate-100 dark:divide-ink-800 md:hidden">
        {transactions.map((t) => (
          <li key={t.id}>
            <button
              onClick={() => onView(t)}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors active:bg-slate-50 dark:active:bg-ink-800"
            >
              <CategoryIcon category={t.category} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{t.description || t.category}</p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">{t.category} • {t.paymentMethod}</p>
                <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">{fmt.date(t.date)}</p>
              </div>
              <Amount tx={t} fmt={fmt} className="shrink-0 text-sm" />
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}
