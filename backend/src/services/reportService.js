import mongoose from 'mongoose';
import Transaction from '../models/Transaction.js';
import { fromMinor } from '../utils/money.js';
import { resolveRange, toDateKey } from '../utils/dates.js';
import { csvText } from '../utils/csv.js';
import { totalsByType } from './analyticsService.js';

const rangeOf = ({ startDate, endDate }) => resolveRange({ range: 'custom', startDate, endDate });

export async function getReportSummary(userId, query) {
  const range = rangeOf(query);
  const match = {
    user: new mongoose.Types.ObjectId(String(userId)),
    type: 'expense',
    date: { $gte: range.start, $lt: range.end },
  };

  const [totals, topRows, largest] = await Promise.all([
    totalsByType(userId, range),
    Transaction.aggregate([
      { $match: match },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
      { $limit: 1 },
    ]),
    Transaction.findOne({ user: userId, type: 'expense', date: match.date }).sort({ amount: -1, _id: -1 }),
  ]);

  const top = topRows[0];
  return {
    range: { startDate: query.startDate, endDate: query.endDate },
    totalIncome: fromMinor(totals.income),
    totalExpenses: fromMinor(totals.expense),
    netSavings: fromMinor(totals.income - totals.expense),
    transactionCount: totals.count,
    topExpenseCategory: top
      ? {
          category: top._id,
          total: fromMinor(top.total),
          percentage: totals.expense ? Math.round((top.total / totals.expense) * 1000) / 10 : 0,
        }
      : null,
    largestExpense: largest ? largest.toJSON() : null,
  };
}

const HEADER = ['Date', 'Type', 'Category', 'Description', 'Payment Method', 'Amount', 'Notes'];

/** Streams the CSV so large exports never sit fully in memory. */
export async function streamCsv(userId, query, res) {
  const range = rangeOf(query);
  const filename = `transactions_${query.startDate}_to_${query.endDate}.csv`;

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.write(`\uFEFF${HEADER.join(',')}\r\n`); // BOM so Excel opens UTF-8 correctly

  const cursor = Transaction.find({ user: userId, date: { $gte: range.start, $lt: range.end } })
    .sort({ date: -1, _id: -1 })
    .cursor();

  for await (const tx of cursor) {
    res.write(
      [
        toDateKey(tx.date),
        csvText(tx.type),
        csvText(tx.category),
        csvText(tx.description),
        csvText(tx.paymentMethod),
        fromMinor(tx.amount).toFixed(2),
        csvText(tx.notes),
      ].join(',') + '\r\n'
    );
  }
  res.end();
}

