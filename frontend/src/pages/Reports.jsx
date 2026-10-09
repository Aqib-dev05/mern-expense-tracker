import { useState } from 'react';
import { Download, FileText, Hash, PiggyBank, ReceiptText, ShoppingBag, TrendingDown, TrendingUp, Trophy } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader.jsx';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { CardSkeleton, EmptyState, ErrorState } from '../components/ui/States.jsx';
import CategoryIcon from '../components/CategoryIcon.jsx';
import useFetch from '../hooks/useFetch.js';
import useFormat from '../hooks/useFormat.js';
import { RANGE_OPTIONS } from '../constants/index.js';
import { downloadCsv, getReportSummary } from '../services/reportService.js';
import { useAppData } from '../store/AppDataContext.jsx';
import { useToast } from '../store/ToastContext.jsx';
import { getPresetRange } from '../utils/dates.js';

function Stat({ icon: Icon, label, tone, children, sub }) {
  return (
    <Card className="flex items-start gap-4">
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tone}`}><Icon className="h-5 w-5" /></span>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{label}</p>
        <div className="mt-1 truncate text-xl font-extrabold text-slate-900 dark:text-white">{children}</div>
        {sub && <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">{sub}</p>}
      </div>
    </Card>
  );
}

export default function Reports() {
  const fmt = useFormat();
  const toast = useToast();
  const { version } = useAppData();
  const [preset, setPreset] = useState('this_month');
  const [dates, setDates] = useState(() => getPresetRange('this_month'));
  const [exporting, setExporting] = useState(false);

  const invalid = !dates.startDate || !dates.endDate || dates.startDate > dates.endDate;
  const { data, loading, error, refetch } = useFetch(
    () => (invalid ? Promise.resolve(null) : getReportSummary(dates)),
    [dates.startDate, dates.endDate, invalid, version]
  );

  const choosePreset = (value) => {
    setPreset(value);
    if (value !== 'custom') setDates(getPresetRange(value));
  };
  const setDate = (k, v) => { setPreset('custom'); setDates((d) => ({ ...d, [k]: v })); };

  const exportCsv = async () => {
    setExporting(true);
    try {
      await downloadCsv(dates);
      toast.success('CSV downloaded');
    } catch (e) { toast.error(e.message); } finally { setExporting(false); }
  };

  const income = 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300';
  const expense = 'bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300';
  const brand = 'bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300';
  const amber = 'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300';

  return (
    <>
      <PageHeader
        title="Reports"
        subtitle="Generate a financial summary for any date range and export it."
        actions={<Button onClick={exportCsv} loading={exporting} disabled={invalid}><Download className="h-4 w-4" /> Export CSV</Button>}
      />

      <Card className="mb-6 space-y-4">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Quick ranges">
          {RANGE_OPTIONS.map((o) => (
            <button
              key={o.value} onClick={() => choosePreset(o.value)} aria-pressed={preset === o.value}
              className={`h-10 rounded-xl px-4 text-sm font-semibold transition-colors ${
                preset === o.value ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-ink-800 dark:text-slate-300 dark:hover:bg-ink-700'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:max-w-lg">
          <Input label="From" type="date" value={dates.startDate} onChange={(e) => setDate('startDate', e.target.value)} />
          <Input label="To" type="date" value={dates.endDate} min={dates.startDate} onChange={(e) => setDate('endDate', e.target.value)}
            error={dates.startDate && dates.endDate && dates.startDate > dates.endDate ? 'Must be on or after the start date' : undefined} />
        </div>
      </Card>

      {loading && !data ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} height="h-28" />)}</div>
      ) : error && !data ? (
        <Card padded={false}><ErrorState message={error.message} onRetry={refetch} /></Card>
      ) : !data ? (
        <Card padded={false}><EmptyState icon={FileText} title="Choose a valid date range" description="Pick a start and end date to generate your report." /></Card>
      ) : data.transactionCount === 0 ? (
        <Card padded={false}><EmptyState icon={ReceiptText} title="No transactions in this period" description="Try another date range, or add transactions to include them in reports." /></Card>
      ) : (
        <div className={`grid grid-cols-1 gap-4 transition-opacity sm:grid-cols-2 xl:grid-cols-3 ${loading ? 'opacity-60' : ''}`}>
          <Stat icon={TrendingUp} label="Total income" tone={income}>{fmt.money(data.totalIncome)}</Stat>
          <Stat icon={TrendingDown} label="Total expenses" tone={expense}>{fmt.money(data.totalExpenses)}</Stat>
          <Stat icon={PiggyBank} label="Net savings" tone={amber}>
            <span className={data.netSavings < 0 ? 'text-rose-600 dark:text-rose-400' : ''}>{fmt.money(data.netSavings)}</span>
          </Stat>
          <Stat icon={Trophy} label="Top expense category" tone={brand} sub={data.topExpenseCategory ? `${fmt.money(data.topExpenseCategory.total)} · ${data.topExpenseCategory.percentage}% of expenses` : undefined}>
            {data.topExpenseCategory ? (
              <span className="inline-flex items-center gap-2"><CategoryIcon category={data.topExpenseCategory.category} size="sm" />{data.topExpenseCategory.category}</span>
            ) : '—'}
          </Stat>
          <Stat icon={ShoppingBag} label="Largest expense" tone={expense}
            sub={data.largestExpense ? `${data.largestExpense.description || data.largestExpense.category} · ${fmt.date(data.largestExpense.date)}` : undefined}>
            {data.largestExpense ? fmt.money(data.largestExpense.amount) : '—'}
          </Stat>
          <Stat icon={Hash} label="Transactions" tone={brand}>{data.transactionCount}</Stat>
        </div>
      )}
    </>
  );
}
