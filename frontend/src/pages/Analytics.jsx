import { useState } from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { BarChart3, TrendingDown, TrendingUp, PiggyBank } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader.jsx';
import Card, { CardHeader } from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import Select from '../components/ui/Select.jsx';
import { Input } from '../components/ui/Input.jsx';
import { CardSkeleton, EmptyState, ErrorState, Skeleton } from '../components/ui/States.jsx';
import SummaryCard from '../components/SummaryCard.jsx';
import CategoryDonut from '../components/charts/CategoryDonut.jsx';
import ChartTooltip from '../components/charts/ChartTooltip.jsx';
import useFetch from '../hooks/useFetch.js';
import useFormat from '../hooks/useFormat.js';
import { RANGE_OPTIONS } from '../constants/index.js';
import { getCategories, getSummary, getTrend } from '../services/analyticsService.js';
import { useAppData } from '../store/AppDataContext.jsx';
import { formatBucketKey, formatCompact, toDateInput } from '../utils/format.js';

const INCOME = '#10b981';
const EXPENSE = '#f43f5e';
const BRAND = '#3f5df0';

function ChartCard({ title, subtitle, state, empty, children }) {
  const { data, loading, error, refetch } = state;
  return (
    <Card>
      <CardHeader title={title} subtitle={subtitle} />
      {loading && !data ? <Skeleton className="h-64 w-full" />
        : error && !data ? <ErrorState compact message={error.message} onRetry={refetch} />
        : empty ? <EmptyState icon={BarChart3} title="Nothing to chart yet" description="Add transactions in this period to see this chart." />
        : children}
    </Card>
  );
}

export default function Analytics() {
  const fmt = useFormat();
  const { version } = useAppData();
  const [range, setRange] = useState('this_month');
  const [custom, setCustom] = useState({ startDate: toDateInput(new Date(new Date().getFullYear(), new Date().getMonth(), 1)), endDate: toDateInput() });
  const [applied, setApplied] = useState(custom);

  const customInvalid = !custom.startDate || !custom.endDate || custom.startDate > custom.endDate;
  const params = range === 'custom' ? { range, ...applied } : { range };
  const key = JSON.stringify(params);

  const summary = useFetch(() => getSummary(params), [key, version]);
  const trend = useFetch(() => getTrend(params), [key, version]);
  const cats = useFetch(() => getCategories({ ...params, type: 'expense' }), [key, version]);

  const trendData = (trend.data?.data || []).map((d) => ({ ...d, label: formatBucketKey(d.key) }));
  const hasTrend = trendData.some((d) => d.income > 0 || d.expense > 0);
  const daily = trend.data?.granularity === 'daily';
  const s = summary.data;
  const axis = { stroke: 'currentColor', strokeOpacity: 0.15 };
  const tick = { fontSize: 11, fill: 'currentColor', opacity: 0.6 };
  const interval = trendData.length > 14 ? Math.ceil(trendData.length / 7) - 1 : 0;

  return (
    <>
      <PageHeader title="Analytics" subtitle="Understand where your money comes from and where it goes." />

      <Card className="mb-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <Select wrapperClassName="sm:w-56" label="Period" options={RANGE_OPTIONS} value={range} onChange={(e) => setRange(e.target.value)} />
          {range === 'custom' && (
            <>
              <Input wrapperClassName="sm:w-44" label="From" type="date" value={custom.startDate} onChange={(e) => setCustom((c) => ({ ...c, startDate: e.target.value }))} />
              <Input wrapperClassName="sm:w-44" label="To" type="date" value={custom.endDate} min={custom.startDate} onChange={(e) => setCustom((c) => ({ ...c, endDate: e.target.value }))}
                error={custom.startDate && custom.endDate && custom.startDate > custom.endDate ? 'Must be after start' : undefined} />
              <Button disabled={customInvalid} onClick={() => setApplied(custom)}>Apply</Button>
            </>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {!s ? (summary.loading ? Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} height="h-32" />) : null) : (
          <>
            <SummaryCard title="Income" value={fmt.money(s.current.income)} icon={TrendingUp} tone="income" change={s.changes.income} comparisonLabel="vs previous period" />
            <SummaryCard title="Expenses" value={fmt.money(s.current.expense)} icon={TrendingDown} tone="expense" change={s.changes.expense} lowerIsBetter comparisonLabel="vs previous period" />
            <SummaryCard title="Net savings" value={fmt.money(s.current.savings)} icon={PiggyBank} tone="savings" change={s.changes.savings} comparisonLabel="vs previous period" />
          </>
        )}
      </div>
      {summary.error && !s && <Card className="mt-4" padded={false}><ErrorState compact message={summary.error.message} onRetry={summary.refetch} /></Card>}

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ChartCard title="Income vs expense" subtitle={daily ? 'Daily comparison' : 'Monthly comparison'} state={trend} empty={!hasTrend}>
          <div className="h-64 text-slate-500 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData} margin={{ top: 8, right: 4, left: 0, bottom: 0 }} barGap={2}>
                <CartesianGrid vertical={false} {...axis} />
                <XAxis dataKey="label" tick={tick} tickLine={false} axisLine={axis} interval={interval} />
                <YAxis tick={tick} tickLine={false} axisLine={false} width={44} tickFormatter={formatCompact} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'currentColor', fillOpacity: 0.06 }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="income" name="Income" fill={INCOME} radius={[4, 4, 0, 0]} maxBarSize={28} />
                <Bar dataKey="expense" name="Expense" fill={EXPENSE} radius={[4, 4, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Expense by category" subtitle="Share of total spending" state={cats} empty={cats.data && cats.data.categories.length === 0}>
          {cats.data && <CategoryDonut data={cats.data.categories} total={cats.data.total} />}
        </ChartCard>
      </div>

      <div className="mt-6">
        <ChartCard title="Spending over time" subtitle={daily ? 'Daily expenses' : 'Monthly expenses'} state={trend} empty={!hasTrend}>
          <div className="h-64 text-slate-500 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="spendFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={BRAND} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={BRAND} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} {...axis} />
                <XAxis dataKey="label" tick={tick} tickLine={false} axisLine={axis} interval={interval} />
                <YAxis tick={tick} tickLine={false} axisLine={false} width={44} tickFormatter={formatCompact} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="expense" name="Expenses" stroke={BRAND} strokeWidth={2.5} fill="url(#spendFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>
    </>
  );
}
