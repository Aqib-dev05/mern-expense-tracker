import { forwardRef, useId } from 'react';
import { ChevronDown } from 'lucide-react';
import { Field, fieldBase, fieldState } from './Input.jsx';

/** options: array of strings or { value, label } */
const Select = forwardRef(function Select(
  { label, error, hint, options = [], placeholder, className = '', wrapperClassName = '', ...props },
  ref
) {
  const id = useId();
  return (
    <Field id={id} label={label} error={error} hint={hint} className={wrapperClassName}>
      <div className="relative">
        <select
          ref={ref}
          id={id}
          aria-invalid={Boolean(error)}
          className={`${fieldBase} ${fieldState(error)} h-11 appearance-none pr-10 sm:h-10 ${className}`}
          {...props}
        >
          {placeholder !== undefined && <option value="">{placeholder}</option>}
          {options.map((o) => {
            const opt = typeof o === 'string' ? { value: o, label: o } : o;
            return <option key={opt.value} value={opt.value}>{opt.label}</option>;
          })}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </div>
    </Field>
  );
});
export default Select;
