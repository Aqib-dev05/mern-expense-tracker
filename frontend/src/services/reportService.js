import api from './api.js';

export const getReportSummary = async (params) => (await api.get('/reports/summary', { params })).data;

export async function downloadCsv({ startDate, endDate }) {
  const res = await api.get('/reports/export', { params: { startDate, endDate }, responseType: 'blob' });
  const url = URL.createObjectURL(res.data);
  const a = document.createElement('a');
  a.href = url;
  a.download = `transactions_${startDate}_to_${endDate}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
