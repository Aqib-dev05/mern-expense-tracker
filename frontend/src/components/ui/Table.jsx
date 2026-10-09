/**
 * Generic table. columns: [{ key, header, className, cellClassName, render(row) }]
 * `className` is applied to both th and td so responsive visibility (e.g. "hidden xl:table-cell") stays in one place.
 */
export default function Table({ columns, rows, rowKey = (r) => r.id, onRowClick }) {
  return (
    <table className="w-full table-fixed text-left text-sm">
      <thead>
        <tr className="border-b border-slate-100 text-xs font-semibold text-slate-500 dark:border-ink-800 dark:text-slate-400">
          {columns.map((c) => (
            <th key={c.key} scope="col" className={`px-4 py-3 ${c.className || ''}`}>{c.header}</th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 dark:divide-ink-800">
        {rows.map((row) => (
          <tr
            key={rowKey(row)}
            onClick={onRowClick ? () => onRowClick(row) : undefined}
            className={onRowClick ? 'cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-ink-800/60' : ''}
          >
            {columns.map((c) => (
              <td key={c.key} className={`px-4 py-3.5 align-middle ${c.className || ''} ${c.cellClassName || ''}`}>
                {c.render ? c.render(row) : row[c.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
