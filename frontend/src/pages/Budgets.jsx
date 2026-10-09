import { useState } from 'react';
import { PiggyBank, Plus } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader.jsx';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import { CardSkeleton, EmptyState, ErrorState } from '../components/ui/States.jsx';
import BudgetCard from '../components/BudgetCard.jsx';
import BudgetFormModal from '../components/BudgetFormModal.jsx';
import useFetch from '../hooks/useFetch.js';
import useFormat from '../hooks/useFormat.js';
import { deleteBudget, listBudgets } from '../services/budgetService.js';
import { useAppData } from '../store/AppDataContext.jsx';
import { useToast } from '../store/ToastContext.jsx';

export default function Budgets() {
  const fmt = useFormat();
  const toast = useToast();
  const { version, invalidate } = useAppData();
  const [form, setForm] = useState({ open: false, budget: null });
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const { data: budgets, loading, error, refetch } = useFetch(() => listBudgets(), [version]);

  const today = new Date().toISOString().slice(0, 10);
  const active = (budgets || []).filter((b) => b.startDate.slice(0, 10) <= today && b.endDate.slice(0, 10) >= today);
  const past = (budgets || []).filter((b) => !active.includes(b));
  const totals = active.reduce((a, b) => ({ budget: a.budget + b.amount, spent: a.spent + b.spent }), { budget: 0, spent: 0 });
  const alerts = active.filter((b) => b.status !== 'ok');

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await deleteBudget(toDelete.id);
      toast.success('Budget deleted');
      setToDelete(null);
      invalidate();
    } catch (e) { toast.error(e.message); } finally { setDeleting(false); }
  };

  const grid = 'grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3';

  return (
    <>
      <PageHeader
        title="Budgets"
        subtitle="Set limits by category and see how you’re tracking. Going over never blocks a transaction."
        actions={<Button onClick={() => setForm({ open: true, budget: null })}><Plus className="h-4 w-4" /> New budget</Button>}
      />

      {loading && !budgets ? (
        <div className={grid}>{Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} height="h-52" />)}</div>
      ) : error && !budgets ? (
        <Card padded={false}><ErrorState message={error.message} onRetry={refetch} /></Card>
      ) : budgets.length === 0 ? (
        <Card padded={false}>
          <EmptyState icon={PiggyBank} title="No budgets yet" description="Create a budget for a category like Food or Shopping to see how much you have left."
            action={<Button onClick={() => setForm({ open: true, budget: null })}><Plus className="h-4 w-4" /> Create budget</Button>} />
        </Card>
      ) : (
        <div className="space-y-8">
          {active.length > 0 && (
            <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Active budgets</p>
                <p className="mt-1 text-xl font-extrabold text-slate-900 dark:text-white">
                  {fmt.money(totals.spent)} <span className="text-base font-semibold text-slate-500 dark:text-slate-400">of {fmt.money(totals.budget)} spent</span>
                </p>
              </div>
              {alerts.length > 0 && (
                <p className="rounded-xl bg-amber-50 px-3.5 py-2.5 text-sm font-semibold text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
                  {alerts.length} {alerts.length === 1 ? 'budget needs' : 'budgets need'} attention: {alerts.map((b) => b.category).join(', ')}
                </p>
              )}
            </Card>
          )}

          {active.length > 0 && (
            <section>
              <div className={grid}>
                {active.map((b) => <BudgetCard key={b.id} budget={b} onEdit={(x) => setForm({ open: true, budget: x })} onDelete={setToDelete} />)}
              </div>
            </section>
          )}

          {past.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Past & upcoming</h2>
              <div className={grid}>
                {past.map((b) => <BudgetCard key={b.id} budget={b} onEdit={(x) => setForm({ open: true, budget: x })} onDelete={setToDelete} />)}
              </div>
            </section>
          )}
        </div>
      )}

      <BudgetFormModal open={form.open} budget={form.budget} onClose={() => setForm((f) => ({ ...f, open: false }))} onSaved={invalidate} />
      <ConfirmDialog
        open={Boolean(toDelete)} loading={deleting} onClose={() => setToDelete(null)} onConfirm={confirmDelete}
        title="Delete budget?" message={toDelete ? `The ${toDelete.category} budget will be removed. Your transactions are not affected.` : ''}
      />
    </>
  );
}
