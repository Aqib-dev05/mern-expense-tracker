import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import TransactionFormModal from '../components/TransactionFormModal.jsx';

/**
 * Cross-page data coordination:
 *  - `version` increments after any mutation, so every page that lists it as a fetch dependency refetches.
 *  - `openTransactionForm()` opens the add/edit modal from anywhere (sidebar, FAB, empty states).
 */
const AppDataContext = createContext(null);

export function AppDataProvider({ children }) {
  const [version, setVersion] = useState(0);
  const [form, setForm] = useState({ open: false, transaction: null });

  const invalidate = useCallback(() => setVersion((v) => v + 1), []);
  const openTransactionForm = useCallback((transaction = null) => setForm({ open: true, transaction }), []);
  const closeTransactionForm = useCallback(() => setForm((f) => ({ ...f, open: false })), []);

  const value = useMemo(() => ({ version, invalidate, openTransactionForm }), [version, invalidate, openTransactionForm]);

  return (
    <AppDataContext.Provider value={value}>
      {children}
      <TransactionFormModal
        open={form.open}
        transaction={form.transaction}
        onClose={closeTransactionForm}
        onSaved={invalidate}
      />
    </AppDataContext.Provider>
  );
}

export const useAppData = () => useContext(AppDataContext);
