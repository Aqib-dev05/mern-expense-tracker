import { Link } from 'react-router-dom';
import { ArrowRight, PieChart as PieIcon, PiggyBank, Plus, Receipt, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader.jsx';
import Card, { CardHeader } from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import { CardSkeleton, EmptyState, ErrorState, ListSkeleton, Skeleton } from '../components/ui/States.jsx';
import SummaryCard from '../components/SummaryCard.jsx';
import TransactionList from '../components/TransactionList.jsx';
import TransactionDetailModal from '../components/TransactionDetailModal.jsx';
import CategoryDonut from '../components/charts/CategoryDonut.jsx';
import ProgressBar from '../components/ui/ProgressBar.jsx';
import CategoryIcon from '../components/CategoryIcon.jsx';
import useFetch from '../hooks/useFetch.js';
import useFormat from '../hooks/useFormat.js';
import { useAppData } from '../store/AppDataContext.jsx';
import { useAuth } from '../store/AuthContext.jsx';
import { getSummary, getCategories } from '../services/analyticsService.js';
import { listTransactions, deleteTransaction } from '../services/transactionService.js';
import { listBudgets } from '../services/budgetService.js';
import { useState } from 'react';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import { useToast } from '../store/ToastContext.jsx';

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
};

export default function Dashboard() {
  const { user } = useAuth();
  const fmt = useFormat();
  const toast = useToast();
  const { version, invalidate, openTransactionForm } = useAppData();
  const [viewId, setViewId] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const summary = useFetch(() => getSummary({ range: 'this_month' }), [version]);
  const cats = useFetch(() => getCategories({ range: 'this_month', type: 'expense' }), [version]);
  const recent = useFetch(() => listTransactions({ page: 1, limit: 6, sort: 'newest' }), [version]);
  const budgets = useFetch(() => listBudgets({ active: 'true' }), [version]);

  const s = summary.data;
  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await deleteTransaction(toDelete.id);
      toast.success('Transaction deleted');
      setToDelete(null);
      setViewId(null);
      invalidate();
    } catch (e) { toast.error(e.message); } finally { setDeleting(false); }
  };

  return (
    <>
      <PageHeader
        title={`${greeting()}, ${user.name.split(' ')[0]}`}
        subtitle="Here’s your financial snapshot for this month."
        actions={<Button className="hidden sm:inline-flex lg:hidden" onClick={() => openTransactionForm()}><Plus className="h-4 w-4" /> Add transaction</Button>}
      />

      {/* Summary cards */}
      {summary.error && !s ? (
        <Card padded={false}><ErrorState message={summary.error.message} onRetry={summary.refetch} compact /></Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {!s ? (
            Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} height="h-36" />)
          ) : (
            <>
              <SummaryCard title="Total Balance" value={fmt.money(s.allTime.balance)} icon={Wallet} tone="brand" footnote="All-time income minus expenses" />
              <SummaryCard title="Income" value={fmt.money(s.current.income)} icon={TrendingUp} tone="income" change={s.changes.income} footnote="This month" />
              <SummaryCard title="Expenses" value={fmt.money(s.current.expense)} icon={TrendingDown} tone="expense" change={s.changes.expense} lowerIsBetter footnote="This month" />
              <SummaryCard
                title="Savings" value={fmt.money(s.current.savings)} icon={PiggyBank} tone="savings" change={s.changes.savings}
                footnote={s.current.income > 0 ? `${s.current.savingsRate}% of this month’s income` : 'This month'}
              />
            </>
          )}
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-5">
        {/* Spending by category */}
        <Card className="xl:col-span-2">
          <CardHeader title="Spending by category" subtitle="This month" />
          {cats.loading && !cats.data ? (
            <div className="flex flex-col items-center gap-4 sm:flex-row"><Skeleton className="h-52 w-52 rounded-full" /><div className="w-full space-y-3"><Skeleton className="h-4" /><Skeleton className="h-4" /><Skeleton className="h-4" /></div></div>
          ) : cats.error && !cats.data ? (
            <ErrorState compact message={cats.error.message} onRetry={cats.refetch} />
          ) : cats.data.categories.length === 0 ? (
            <EmptyState icon={PieIcon} title="No spending yet" description="Expenses you add this month will be broken down here." />
          ) : (
            <CategoryDonut data={cats.data.categories} total={cats.data.total} />
          )}
        </Card>

        {/* Recent transactions */}
        <Card padded={false} className="xl:col-span-3">
          <div className="flex items-center justify-between px-5 pt-5">
            <CardHeader title="Recent transactions" />
            <Link to="/transactions" className="-mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline dark:text-brand-300">View all <ArrowRight className="h-4 w-4" /></Link>
          </div>
          {recent.loading && !recent.data ? (
            <ListSkeleton rows={5} />
          ) : recent.error && !recent.data ? (
            <ErrorState compact message={recent.error.message} onRetry={recent.refetch} />
          ) : recent.data.transactions.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="No transactions yet"
              description="Start tracking your spending by adding your first transaction."
              action={<Button onClick={() => openTransactionForm()}><Plus className="h-4 w-4" /> Add Transaction</Button>}
            />
          ) : (
            <TransactionList transactions={recent.data.transactions} onView={(t) => setViewId(t.id)} compact />
          )}
        </Card>
      </div>

      {/* Budget overview */}
      <Card className="mt-6">
        <CardHeader
          title="Budget overview"
          subtitle="Your active budgets"
          action={<Link to="/budgets"><Button variant="secondary" size="sm">View all budgets</Button></Link>}
        />
        {budgets.loading && !budgets.data ? (
          <div className="space-y-4"><Skeleton className="h-10" /><Skeleton className="h-10" /><Skeleton className="h-10" /></div>
        ) : budgets.error && !budgets.data ? (
          <ErrorState compact message={budgets.error.message} onRetry={budgets.refetch} />
        ) : budgets.data.length === 0 ? (
          <EmptyState icon={PiggyBank} title="No active budgets" description="Set a monthly limit for categories like Food or Shopping and we’ll track it for you."
            action={<Link to="/budgets"><Button>Create a budget</Button></Link>} />
        ) : (
          <ul className="grid gap-x-8 gap-y-5 md:grid-cols-2">
            {budgets.data.slice(0, 4).map((b) => (
              <li key={b.id}>
                <div className="mb-2 flex items-center gap-3">
                  <CategoryIcon category={b.category} size="sm" />
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-900 dark:text-white">{b.category}</span>
                  <span className="shrink-0 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-bold text-slate-800 dark:text-slate-100">{fmt.money(b.spent)}</span> / {fmt.money(b.amount)}
                  </span>
                </div>
                <ProgressBar percentage={b.percentage} status={b.status} label={`${b.category} budget used`} />
              </li>
            ))}
          </ul>
        )}
      </Card>

      <TransactionDetailModal
        id={viewId}
        onClose={() => setViewId(null)}
        onEdit={(t) => { setViewId(null); openTransactionForm(t); }}
        onDelete={(t) => setToDelete(t)}
      />
      <ConfirmDialog
        open={Boolean(toDelete)} loading={deleting} onClose={() => setToDelete(null)} onConfirm={confirmDelete}
        title="Delete transaction?" message="This permanently removes the transaction and updates your balance, budgets and charts."
      />
    </>
  );
}
