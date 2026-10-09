import mongoose from 'mongoose';
import Transaction from '../models/Transaction.js';
import { fromMinor } from '../utils/money.js';
import {
  DAY, resolveRange, previousRange, addDays, addMonths, startOfMonth, toDateKey,
} from '../utils/dates.js';

const oid = (id) => new mongoose.Types.ObjectId(String(id));

/** Sum income/expense (minor units) with a single $group, optionally limited to [start, end). */
export async function totalsByType(userId, range) {
  const match = { user: oid(userId) };
  if (range) match.date = { $gte: range.start, $lt: range.end };
  const rows = await Transaction.aggregate([
    { $match: match },
    { $group: { _id: '$type', total: { $sum: '$amount' }, count: { $sum: 1 } } },
  ]);
  const out = { income: 0, expense: 0, count: 0 };
  for (const r of rows) {
    out[r._id] = r.total;
    out.count += r.count;
  }
  return out;
}

const pctChange = (cur, prev) => {
  if (prev === 0) return cur === 0 ? 0 : null; // null = no baseline to compare against
  return Math.round(((cur - prev) / Math.abs(prev)) * 1000) / 10;
};

export async function getSummary(userId, query) {
  const range = resolveRange(query);
  const prevRange = previousRange(range);
  const [allTime, cur, prev] = await Promise.all([
    totalsByType(userId),
    totalsByType(userId, range),
    totalsByType(userId, prevRange),
  ]);

  const curSavings = cur.income - cur.expense;
  const prevSavings = prev.income - prev.expense;

  return {
    range: { startDate: toDateKey(range.start), endDate: toDateKey(addDays(range.end, -1)) },
    allTime: {
      income: fromMinor(allTime.income),
      expense: fromMinor(allTime.expense),
      balance: fromMinor(allTime.income - allTime.expense),
    },
    current: {
      income: fromMinor(cur.income),
      expense: fromMinor(cur.expense),
      savings: fromMinor(curSavings),
      savingsRate: cur.income > 0 ? Math.round((curSavings / cur.income) * 1000) / 10 : 0,
      transactionCount: cur.count,
    },
    previous: {
      income: fromMinor(prev.income),
      expense: fromMinor(prev.expense),
      savings: fromMinor(prevSavings),
    },
    changes: {
      income: pctChange(cur.income, prev.income),
      expense: pctChange(cur.expense, prev.expense),
      savings: pctChange(curSavings, prevSavings),
    },
  };
}

/** Income vs expense over time. Daily buckets for short ranges, monthly otherwise. */
export async function getTrend(userId, query) {
  const range = resolveRange(query);
  const granularity = (range.end - range.start) / DAY <= 62 ? 'daily' : 'monthly';
  const format = granularity === 'daily' ? '%Y-%m-%d' : '%Y-%m';

  const rows = await Transaction.aggregate([
    { $match: { user: oid(userId), date: { $gte: range.start, $lt: range.end } } },
    {
      $group: {
        _id: { key: { $dateToString: { format, date: '$date', timezone: 'UTC' } }, type: '$type' },
        total: { $sum: '$amount' },
      },
    },
  ]);

  const buckets = new Map();
  if (granularity === 'daily') {
    for (let d = range.start; d < range.end; d = addDays(d, 1)) buckets.set(toDateKey(d), { income: 0, expense: 0 });
  } else {
    for (let d = startOfMonth(range.start); d < range.end; d = addMonths(d, 1)) {
      buckets.set(toDateKey(d).slice(0, 7), { income: 0, expense: 0 });
    }
  }
  for (const r of rows) {
    const b = buckets.get(r._id.key);
    if (b) b[r._id.type] = r.total;
  }

  return {
    granularity,
    range: { startDate: toDateKey(range.start), endDate: toDateKey(addDays(range.end, -1)) },
    data: [...buckets.entries()].map(([key, v]) => ({
      key,
      income: fromMinor(v.income),
      expense: fromMinor(v.expense),
    })),
  };
}

export async function getCategoryBreakdown(userId, query) {
  const range = resolveRange(query);
  const type = query.type || 'expense';
  const rows = await Transaction.aggregate([
    { $match: { user: oid(userId), type, date: { $gte: range.start, $lt: range.end } } },
    { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
    { $sort: { total: -1 } },
  ]);
  const grand = rows.reduce((s, r) => s + r.total, 0);
  return {
    type,
    total: fromMinor(grand),
    categories: rows.map((r) => ({
      category: r._id,
      total: fromMinor(r.total),
      count: r.count,
      percentage: grand ? Math.round((r.total / grand) * 1000) / 10 : 0,
    })),
  };
}
