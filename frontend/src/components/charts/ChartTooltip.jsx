import useFormat from '../../hooks/useFormat.js';

export default function ChartTooltip({ active, payload, label, labelFormatter }) {
  const fmt = useFormat();
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg dark:border-ink-700 dark:bg-ink-800">
      <p className="mb-1 font-bold text-slate-900 dark:text-white">{labelFormatter ? labelFormatter(label) : label}</p>
      {payload.map((p) => (
        <p key={p.dataKey || p.name} className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color || p.payload?.fill }} />
          <span>{p.name}:</span>
          <span className="font-bold text-slate-900 dark:text-white">{fmt.money(p.value)}</span>
        </p>
      ))}
    </div>
  );
}
