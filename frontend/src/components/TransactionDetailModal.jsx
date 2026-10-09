import { Pencil, Trash2 } from 'lucide-react';
import Modal from './ui/Modal.jsx';
import Button from './ui/Button.jsx';
import Badge from './ui/Badge.jsx';
import { LoadingState, ErrorState } from './ui/States.jsx';
import CategoryIcon from './CategoryIcon.jsx';
import useFetch from '../hooks/useFetch.js';
import useFormat from '../hooks/useFormat.js';
import { getTransaction } from '../services/transactionService.js';

function Row({ label, children }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <dt className="text-sm text-slate-500 dark:text-slate-400">{label}</dt>
      <dd className="text-right text-sm font-semibold text-slate-900 dark:text-slate-100">{children}</dd>
    </div>
  );
}

/** Fetches the transaction by id so the modal always shows the current stored values. */
export default function TransactionDetailModal({ id, onClose, onEdit, onDelete }) {
  const fmt = useFormat();
  const { data, loading, error, refetch } = useFetch(() => (id ? getTransaction(id) : Promise.resolve(null)), [id]);
  // Ignore data left over from a previously opened transaction so actions never target the wrong record.
  const tx = data && data.id === id ? data : null;
  const isIncome = tx?.type === 'income';

  return (
    <Modal
      open={Boolean(id)}
      onClose={onClose}
      title="Transaction details"
      footer={
        tx && (
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={() => onDelete(tx)}><Trash2 className="h-4 w-4" /> Delete</Button>
            <Button onClick={() => onEdit(tx)}><Pencil className="h-4 w-4" /> Edit</Button>
          </div>
        )
      }
    >
      {loading && !tx && <LoadingState />}
      {error && !tx && <ErrorState compact message={error.message} onRetry={refetch} />}
      {tx && (
        <div>
          <div className="mb-3 flex items-center gap-3">
            <CategoryIcon category={tx.category} size="lg" />
            <div className="min-w-0">
              <p className="truncate text-base font-bold text-slate-900 dark:text-white">{tx.description || tx.category}</p>
              <p className={`text-2xl font-extrabold ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {fmt.money(isIncome ? tx.amount : -tx.amount, { sign: true })}
              </p>
            </div>
          </div>
          <dl className="divide-y divide-slate-100 dark:divide-ink-800">
            <Row label="Type"><Badge tone={isIncome ? 'income' : 'expense'}>{isIncome ? 'Income' : 'Expense'}</Badge></Row>
            <Row label="Category">{tx.category}</Row>
            <Row label="Payment method">{tx.paymentMethod}</Row>
            <Row label="Date">{fmt.date(tx.date)}</Row>
            {tx.notes && <Row label="Notes"><span className="whitespace-pre-wrap font-medium">{tx.notes}</span></Row>}
          </dl>
        </div>
      )}
    </Modal>
  );
}
