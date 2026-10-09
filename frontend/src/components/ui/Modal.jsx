import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const sizes = { sm: 'sm:max-w-md', md: 'sm:max-w-lg', lg: 'sm:max-w-2xl' };

/** Bottom sheet on phones, centred dialog from `sm` up. */
export default function Modal({ open, onClose, title, children, footer, size = 'md' }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-slate-950/50" onClick={onClose} aria-hidden />
      <div className={`relative flex max-h-[92dvh] w-full flex-col rounded-t-3xl bg-white shadow-xl dark:bg-ink-900 sm:rounded-2xl ${sizes[size]}`}>
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4 dark:border-ink-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="-mr-1.5 rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-ink-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
        {footer && (
          <div className="pb-safe border-t border-slate-100 px-5 py-4 dark:border-ink-800">{footer}</div>
        )}
      </div>
    </div>,
    document.body
  );
}
