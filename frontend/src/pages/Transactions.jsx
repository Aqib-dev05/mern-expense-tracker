import { useEffect, useState } from 'react';
import { Filter, Plus, Receipt, Search, SearchX, X } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader.jsx';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import Select from '../components/ui/Select.jsx';
import { Input } from '../components/ui/Input.jsx';
import Pagination from '../components/ui/Pagination.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import { EmptyState, ErrorState, ListSkeleton } from '../components/ui/States.jsx';
import TransactionList from '../components/TransactionList.jsx';
import TransactionDetailModal from '../components/TransactionDetailModal.jsx';
import useDebounce from '../hooks/useDebounce.js';
import useFetch from '../hooks/useFetch.js';
import { ALL_CATEGORIES, PAYMENT_METHODS, SORT_OPTIONS } from '../constants/index.js';
import { deleteTransaction, listTransactions } from '../services/transactionService.js';
import { useAppData } from '../store/AppDataContext.jsx';
import { useToast } from '../store/ToastContext.jsx';

const LIMIT = 10;
const TYPE_TABS = [
  { value: '', label: 'All' },
  { value: 'income', label: 'Income' },
  { value: 'expense', label: 'Expense' },
];
const INITIAL = { search: '', type: '', category: '', paymentMethod: '', startDate: '', endDate: '', sort: 'newest' };

export default function Transactions() {
  const toast = useToast();
  const { version, invalidate, openTransactionForm } = useAppData();
  const [filters, setFilters] = useState(INITIAL);
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [viewId, setViewId] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const debouncedSearch = useDebounce(filters.search, 400);
  const dateError = filters.startDate && filters.endDate && filters.startDate > filters.endDate ? 'Start date must be before end date' : null;

  const { data, loading, error, refetch } = useFetch(
    () => (dateError ? Promise.resolve(null) : listTransactions({ ...filters, search: debouncedSearch.trim(), page, limit: LIMIT })),
    [debouncedSearch, filters.type, filters.category, filters.paymentMethod, filters.startDate, filters.endDate, filters.sort, page, version, dateError]
  );

  // Clamp the page if the result set shrank (e.g. after deleting the last item on the last page)
  useEffect(() => {
    if (data && data.totalPages > 0 && page > data.totalPages) setPage(data.totalPages);
  }, [data, page]);

  const setFilter = (key, value) => { setFilters((f) => ({ ...f, [key]: value })); setPage(1); };
  const activeCount = ['type', 'category', 'paymentMethod', 'startDate', 'endDate'].filter((k) => filters[k]).length + (filters.search ? 1 : 0);
  const clearAll = () => { setFilters((f) => ({ ...INITIAL, sort: f.sort })); setPage(1); };

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

  const transactions = data?.transactions;
  const refreshing = loading && Boolean(data);

  return (
    <>
      <PageHeader
        title="Transactions"
        subtitle="Search, filter and manage everything you’ve earned and spent."
        actions={<Button onClick={() => openTransactionForm()}><Plus className="h-4 w-4" /> Add transaction</Button>}
      />

      <Card className="mb-4 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            wrapperClassName="flex-1" leftIcon={Search} type="search" placeholder="Search description or category"
            aria-label="Search transactions" value={filters.search} onChange={(e) => setFilter('search', e.target.value)}
          />
          <div className="flex gap-3">
            <Select wrapperClassName="flex-1 sm:w-48 sm:flex-none" aria-label="Sort" options={SORT_OPTIONS} value={filters.sort} onChange={(e) => setFilter('sort', e.target.value)} />
            <Button variant="secondary" className="relative lg:hidden" onClick={() => setShowFilters((s) => !s)} aria-expanded={showFilters}>
              <Filter className="h-4 w-4" /> Filters
              {activeCount > 0 && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1 text-[11px] text-white">{activeCount}</span>}
            </Button>
          </div>
        </div>

        <div className={`${showFilters ? 'block' : 'hidden'} space-y-4 lg:block`}>
          <div className="grid grid-cols-3 gap-1.5 rounded-xl bg-slate-100 p-1 dark:bg-ink-800 sm:inline-grid sm:w-80" role="tablist" aria-label="Type">
            {TYPE_TABS.map((t) => (
              <button
                key={t.label} role="tab" aria-selected={filters.type === t.value} onClick={() => setFilter('type', t.value)}
                className={`h-10 rounded-lg text-sm font-semibold transition-colors sm:h-9 ${
                  filters.type === t.value ? 'bg-white text-slate-900 shadow-sm dark:bg-ink-700 dark:text-white' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Select aria-label="Category" placeholder="All categories" options={ALL_CATEGORIES} value={filters.category} onChange={(e) => setFilter('category', e.target.value)} />
            <Select aria-label="Payment method" placeholder="All payment methods" options={PAYMENT_METHODS} value={filters.paymentMethod} onChange={(e) => setFilter('paymentMethod', e.target.value)} />
            <Input aria-label="From date" type="date" value={filters.startDate} max={filters.endDate || undefined} onChange={(e) => setFilter('startDate', e.target.value)} error={dateError} />
            <Input aria-label="To date" type="date" value={filters.endDate} min={filters.startDate || undefined} onChange={(e) => setFilter('endDate', e.target.value)} />
          </div>
          {activeCount > 0 && (
            <button onClick={clearAll} className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:underline dark:text-brand-300">
              <X className="h-4 w-4" /> Clear all filters
            </button>
          )}
        </div>
      </Card>

      <Card padded={false} className={`transition-opacity ${refreshing ? 'opacity-60' : ''}`}>
        {loading && !data ? (
          <ListSkeleton rows={LIMIT / 2} />
        ) : error && !data ? (
          <ErrorState message={error.message} onRetry={refetch} />
        ) : transactions && transactions.length === 0 ? (
          activeCount > 0 ? (
            <EmptyState icon={SearchX} title="No matching transactions" description="Try a different search or loosen your filters."
              action={<Button variant="secondary" onClick={clearAll}>Clear filters</Button>} />
          ) : (
            <EmptyState icon={Receipt} title="No transactions yet" description="Start tracking your spending by adding your first transaction."
              action={<Button onClick={() => openTransactionForm()}><Plus className="h-4 w-4" /> Add Transaction</Button>} />
          )
        ) : transactions ? (
          <TransactionList transactions={transactions} onView={(t) => setViewId(t.id)} onEdit={openTransactionForm} onDelete={setToDelete} />
        ) : null}
      </Card>

      {data && data.totalPages > 1 && (
        <div className="mt-4">
          <Pagination page={data.page} totalPages={data.totalPages} total={data.total} limit={data.limit} onChange={setPage} />
        </div>
      )}
      {error && data && <p className="mt-3 text-center text-sm text-rose-600">{error.message} <button className="font-semibold underline" onClick={refetch}>Retry</button></p>}

      <TransactionDetailModal
        id={viewId}
        onClose={() => setViewId(null)}
        onEdit={(t) => { setViewId(null); openTransactionForm(t); }}
        onDelete={setToDelete}
      />
      <ConfirmDialog
        open={Boolean(toDelete)} loading={deleting} onClose={() => setToDelete(null)} onConfirm={confirmDelete}
        title="Delete transaction?" message="This permanently removes the transaction and updates your balance, budgets and charts."
      />
    </>
  );
}
