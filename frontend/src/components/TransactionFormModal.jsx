import { useEffect, useState } from 'react';
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import Modal from './ui/Modal.jsx';
import Button from './ui/Button.jsx';
import Select from './ui/Select.jsx';
import { Input, Textarea } from './ui/Input.jsx';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, PAYMENT_METHODS, categoryMeta } from '../constants/index.js';
import { createTransaction, updateTransaction } from '../services/transactionService.js';
import { useToast } from '../store/ToastContext.jsx';
import { toDateInput } from '../utils/format.js';

const emptyForm = () => ({
  type: 'expense', amount: '', category: '', description: '', paymentMethod: 'Cash', date: toDateInput(), notes: '',
});

function validate(f) {
  const e = {};
  if (!['income', 'expense'].includes(f.type)) e.type = 'Choose income or expense';
  const amt = Number(f.amount);
  if (f.amount === '' || !Number.isFinite(amt)) e.amount = 'Enter an amount';
  else if (amt <= 0) e.amount = 'Amount must be greater than 0';
  else if (!/^\d+(\.\d{1,2})?$/.test(String(f.amount))) e.amount = 'Use at most 2 decimal places';
  if (!f.category) e.category = 'Pick a category';
  if (!f.date || Number.isNaN(Date.parse(f.date))) e.date = 'Choose a valid date';
  if (f.description.length > 200) e.description = 'Keep it under 200 characters';
  if (f.notes.length > 1000) e.notes = 'Keep notes under 1000 characters';
  return e;
}

export default function TransactionFormModal({ open, transaction, onClose, onSaved }) {
  const toast = useToast();
  const editing = Boolean(transaction);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setForm(
      transaction
        ? {
            type: transaction.type,
            amount: String(transaction.amount),
            category: transaction.category,
            description: transaction.description || '',
            paymentMethod: transaction.paymentMethod || 'Cash',
            date: transaction.date.slice(0, 10),
            notes: transaction.notes || '',
          }
        : emptyForm()
    );
  }, [open, transaction]);

  const set = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const setType = (type) => {
    setForm((f) => {
      const list = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
      return { ...f, type, category: list.includes(f.category) ? f.category : '' };
    });
    setErrors((e) => ({ ...e, type: undefined, category: undefined }));
  };

  const onAmount = (v) => {
    if (/^\d*\.?\d{0,2}$/.test(v)) set('amount', v);
  };

  const submit = async (ev) => {
    ev.preventDefault();
    const found = validate(form);
    if (Object.keys(found).length) return setErrors(found);

    const payload = {
      type: form.type,
      amount: Number(form.amount),
      category: form.category,
      description: form.description.trim(),
      paymentMethod: form.paymentMethod,
      date: form.date,
      notes: form.notes.trim(),
    };
    setSaving(true);
    try {
      if (editing) await updateTransaction(transaction.id, payload);
      else await createTransaction(payload);
      toast.success(editing ? 'Transaction updated' : 'Transaction added');
      onSaved?.();
      onClose();
    } catch (err) {
      if (err.details?.length) {
        setErrors(Object.fromEntries(err.details.map((d) => [d.field, d.message])));
      }
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const categories = form.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <Modal
      open={open}
      onClose={saving ? () => {} : onClose}
      title={editing ? 'Edit transaction' : 'Add transaction'}
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button type="submit" form="transaction-form" loading={saving}>{editing ? 'Save changes' : 'Add transaction'}</Button>
        </div>
      }
    >
      <form id="transaction-form" onSubmit={submit} noValidate className="space-y-5">
        <div>
          <div className="grid grid-cols-2 gap-1.5 rounded-2xl bg-slate-100 p-1.5 dark:bg-ink-800" role="radiogroup" aria-label="Transaction type">
            {[
              { value: 'expense', label: 'Expense', icon: ArrowDownCircle, on: 'text-rose-600' },
              { value: 'income', label: 'Income', icon: ArrowUpCircle, on: 'text-emerald-600' },
            ].map(({ value, label, icon: Icon, on }) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={form.type === value}
                onClick={() => setType(value)}
                className={`flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-colors ${
                  form.type === value ? `bg-white shadow-sm dark:bg-ink-700 ${on}` : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <Icon className="h-4 w-4" /> {label}
              </button>
            ))}
          </div>
          {errors.type && <p className="mt-1.5 text-xs font-medium text-rose-600">{errors.type}</p>}
        </div>

        <Input
          label="Amount"
          inputMode="decimal"
          placeholder="0.00"
          autoComplete="off"
          value={form.amount}
          onChange={(e) => onAmount(e.target.value)}
          error={errors.amount}
          className="text-lg font-bold"
        />

        <div>
          <span className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">Category</span>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4" role="radiogroup" aria-label="Category">
            {categories.map((c) => {
              const { emoji, color } = categoryMeta(c);
              const active = form.category === c;
              return (
                <button
                  key={c}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => set('category', c)}
                  className={`flex min-h-[4.25rem] flex-col items-center justify-center gap-1 rounded-xl border px-1 py-2 text-xs font-semibold transition-colors ${
                    active
                      ? 'border-transparent text-slate-900 ring-2 dark:text-white'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-ink-700 dark:text-slate-300 dark:hover:bg-ink-800'
                  }`}
                  style={active ? { backgroundColor: `${color}1f`, '--tw-ring-color': color } : undefined}
                >
                  <span className="text-xl" aria-hidden>{emoji}</span>
                  <span className="max-w-full truncate">{c}</span>
                </button>
              );
            })}
          </div>
          {errors.category && <p role="alert" className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">{errors.category}</p>}
        </div>

        <Input
          label="Description (optional)"
          placeholder="e.g. Dinner with friends"
          maxLength={200}
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          error={errors.description}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select label="Payment method" options={PAYMENT_METHODS} value={form.paymentMethod} onChange={(e) => set('paymentMethod', e.target.value)} error={errors.paymentMethod} />
          <Input label="Date" type="date" value={form.date} onChange={(e) => set('date', e.target.value)} error={errors.date} />
        </div>

        <Textarea
          label="Notes (optional)"
          placeholder="Anything worth remembering"
          maxLength={1000}
          value={form.notes}
          onChange={(e) => set('notes', e.target.value)}
          error={errors.notes}
        />
      </form>
    </Modal>
  );
}
