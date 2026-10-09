import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { categoryMeta } from '../../constants/index.js';
import useFormat from '../../hooks/useFormat.js';
import ChartTooltip from './ChartTooltip.jsx';

/** data: [{ category, total, percentage }] */
export default function CategoryDonut({ data, total, totalLabel = 'Total spent' }) {
  const fmt = useFormat();
  const chartData = data.map((d) => ({ name: d.category, value: d.total, fill: categoryMeta(d.category).color }));

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
      <div className="relative h-52 w-52 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={chartData} dataKey="value" nameKey="name" innerRadius="64%" outerRadius="100%" paddingAngle={2} stroke="none">
              {chartData.map((d) => <Cell key={d.name} fill={d.fill} />)}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
          <span className="text-xs text-slate-500 dark:text-slate-400">{totalLabel}</span>
          <span className="max-w-full truncate text-base font-extrabold text-slate-900 dark:text-white">{fmt.money(total)}</span>
        </div>
      </div>

      <ul className="w-full min-w-0 flex-1 space-y-2.5">
        {data.slice(0, 7).map((d) => (
          <li key={d.category} className="flex items-center gap-3 text-sm">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: categoryMeta(d.category).color }} />
            <span className="min-w-0 flex-1 truncate font-medium text-slate-700 dark:text-slate-200">{d.category}</span>
            <span className="shrink-0 font-bold text-slate-900 dark:text-white">{d.percentage}%</span>
            <span className="hidden w-24 shrink-0 text-right text-slate-500 dark:text-slate-400 sm:block">{fmt.money(d.total)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
