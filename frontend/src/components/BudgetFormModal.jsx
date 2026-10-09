import { useEffect, useState } from 'react';
import Modal from './ui/Modal.jsx';
import Button from './ui/Button.jsx';
import Select from './ui/Select.jsx';
import { Input } from './ui/Input.jsx';
import { EXPENSE_CATEGORIES, BUDGET_PERIODS } from '../constants/index.js';
import { createBudget, updateBudget } from '../services/budgetService.js';
import { useToast } from '../store/ToastContext.jsx';
import { toDateInput } from '../utils/format.js';

const defaultStart = (period) => {
  const n = new Date();
  if (period === 'monthly') return toDateInput(new Date(n.getFullYear(), n.getMonth(), 1));
  if (period === 'yearly') return toDateInput(new Date(n.getFullYear(), 0, 1));
  return toDateInput(n);
};
const endOfMonth = () => { const n = new Date(); return toDateInput(new Date(n.getFullYear(), n.getMonth() + 1, 0)); };

const empty = () => ({ category: '', amount: '', period: 'monthly', startDate: defaultStart('monthly'), endDate: endOfMonth() });

export default function BudgetFormModal({ open, budget, onClose, onSaved }) {
  const toast = useToast();
  const editing = Boolean(budget);
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setForm(
      budget
        ? { category: budget.category, amount: String(budget.amount), period: budget.period, startDate: budget.startDate.slice(0, 10), endDate: budget.endDate.slice(0, 10) }
        : empty()
    );
  }, [open, budget]);

  const set = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setErrors((e) => ({ ...e, [k]: undefined })); };
  const setPeriod = (period) => setForm((f) => ({ ...f, period, startDate: defaultStart(period) }));

  const submit = async (ev) => {
    ev.preventDefault();
    const e = {};
    const amt = Number(form.amount);
    if (!form.category) e.category = 'Pick a category';
    if (form.amount === '' || !Number.isFinite(amt) || amt <= 0) e.amount = 'Amount must be greater than 0';
    if (!form.startDate) e.startDate = 'Choose a start date';
    if (form.period === 'custom') {
      if (!form.endDate) e.endDate = 'Choose an end date';
      else if (form.endDate < form.startDate) e.endDate = 'End date must be after the start date';
    }
    if (Object.keys(e).length) return setErrors(e);

    const payload = { category: form.category, amount: amt, period: form.period, startDate: form.startDate };
    if (form.period === 'custom') payload.endDate = form.endDate;

    setSaving(true);
    try {
      if (editing) await updateBudget(budget.id, payload);
      else await createBudget(payload);
      toast.success(editing ? 'Budget updated' : 'Budget created');
      onSaved?.();
      onClose();
    } catch (err) {
      if (err.details?.length) setErrors(Object.fromEntries(err.details.map((d) => [d.field, d.message])));
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={saving ? () => {} : onClose}
      title={editing ? 'Edit budget' : 'New budget'}
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button type="submit" form="budget-form" loading={saving}>{editing ? 'Save changes' : 'Create budget'}</Button>
        </div>
      }
    >
      <form id="budget-form" onSubmit={submit} noValidate className="space-y-4">
        <Select label="Category" placeholder="Select a category" options={EXPENSE_CATEGORIES} value={form.category} onChange={(e) => set('category', e.target.value)} error={errors.category} />
        <Input label="Budget amount" inputMode="decimal" placeholder="0.00" value={form.amount}
          onChange={(e) => /^\d*\.?\d{0,2}$/.test(e.target.value) && set('amount', e.target.value)} error={errors.amount} />
        <Select label="Period" options={BUDGET_PERIODS} value={form.period} onChange={(e) => setPeriod(e.target.value)} error={errors.period} />
        <div className={`grid gap-4 ${form.period === 'custom' ? 'sm:grid-cols-2' : ''}`}>
          <Input label="Start date" type="date" value={form.startDate} onChange={(e) => set('startDate', e.target.value)} error={errors.startDate}
            hint={form.period !== 'custom' ? 'The end date is calculated from the period.' : undefined} />
          {form.period === 'custom' && (
            <Input label="End date" type="date" value={form.endDate} onChange={(e) => set('endDate', e.target.value)} error={errors.endDate} />
          )}
        </div>
      </form>
    </Modal>
  );
}
