import { forwardRef, useId } from 'react';

export const fieldBase =
  'block w-full rounded-xl border bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-ink-800 dark:text-slate-100 dark:placeholder:text-slate-500';
export const fieldState = (error) =>
  error
    ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20 dark:border-rose-500/70'
    : 'border-slate-300 focus:border-brand-500 focus:ring-brand-500/20 dark:border-ink-700';

export function Field({ id, label, error, hint, children, className = '' }) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">
          {label}
        </label>
      )}
      {children}
      {error ? (
        <p role="alert" className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">{hint}</p>
      ) : null}
    </div>
  );
}

export const Input = forwardRef(function Input({ label, error, hint, leftIcon: Icon, className = '', wrapperClassName = '', ...props }, ref) {
  const id = useId();
  return (
    <Field id={id} label={label} error={error} hint={hint} className={wrapperClassName}>
      <div className="relative">
        {Icon && <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />}
        <input
          ref={ref}
          id={id}
          aria-invalid={Boolean(error)}
          className={`${fieldBase} ${fieldState(error)} h-11 sm:h-10 ${Icon ? 'pl-10' : ''} ${className}`}
          {...props}
        />
      </div>
    </Field>
  );
});

export const Textarea = forwardRef(function Textarea({ label, error, hint, className = '', wrapperClassName = '', ...props }, ref) {
  const id = useId();
  return (
    <Field id={id} label={label} error={error} hint={hint} className={wrapperClassName}>
      <textarea
        ref={ref}
        id={id}
        rows={3}
        aria-invalid={Boolean(error)}
        className={`${fieldBase} ${fieldState(error)} resize-none py-2.5 ${className}`}
        {...props}
      />
    </Field>
  );
});
