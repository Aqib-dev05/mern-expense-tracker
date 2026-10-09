import Transaction from '../models/Transaction.js';
import ApiError from '../utils/ApiError.js';
import { toMinor } from '../utils/money.js';
import { parseDateOnly, addDays } from '../utils/dates.js';
import { categoriesFor } from '../validators/schemas.js';

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const SORTS = {
  newest: { date: -1, _id: -1 },
  oldest: { date: 1, _id: 1 },
  highest: { amount: -1, _id: -1 },
  lowest: { amount: 1, _id: 1 },
};

/** Always starts from { user } so no query can ever cross tenants. */
export function buildFilter(userId, q = {}) {
  const filter = { user: userId };
  if (q.type) filter.type = q.type;
  if (q.category) filter.category = q.category;
  if (q.paymentMethod) filter.paymentMethod = q.paymentMethod;
  if (q.startDate || q.endDate) {
    filter.date = {};
    if (q.startDate) filter.date.$gte = parseDateOnly(q.startDate);
    if (q.endDate) filter.date.$lt = addDays(parseDateOnly(q.endDate), 1);
  }
  if (q.search) {
    const rx = new RegExp(escapeRegex(q.search), 'i');
    filter.$or = [{ description: rx }, { category: rx }];
  }
  return filter;
}

export async function listTransactions(userId, q) {
  const filter = buildFilter(userId, q);
  const [transactions, total] = await Promise.all([
    Transaction.find(filter)
      .sort(SORTS[q.sort] || SORTS.newest)
      .skip((q.page - 1) * q.limit)
      .limit(q.limit),
    Transaction.countDocuments(filter),
  ]);
  return { transactions, page: q.page, limit: q.limit, total, totalPages: Math.ceil(total / q.limit) };
}

export async function getTransaction(userId, id) {
  const tx = await Transaction.findOne({ _id: id, user: userId });
  if (!tx) throw new ApiError(404, 'Transaction not found');
  return tx;
}

export async function createTransaction(userId, data) {
  return Transaction.create({
    user: userId,
    type: data.type,
    amount: toMinor(data.amount),
    category: data.category,
    description: data.description,
    paymentMethod: data.paymentMethod,
    date: parseDateOnly(data.date),
    notes: data.notes,
  });
}

export async function updateTransaction(userId, id, data) {
  const tx = await getTransaction(userId, id);

  const type = data.type ?? tx.type;
  const category = data.category ?? tx.category;
  if (!categoriesFor(type).includes(category)) {
    throw new ApiError(400, `Invalid category for ${type}`, [{ field: 'category', message: `Invalid category for ${type}` }]);
  }

  tx.type = type;
  tx.category = category;
  if (data.amount !== undefined) tx.amount = toMinor(data.amount);
  if (data.description !== undefined) tx.description = data.description;
  if (data.paymentMethod !== undefined) tx.paymentMethod = data.paymentMethod;
  if (data.date !== undefined) tx.date = parseDateOnly(data.date);
  if (data.notes !== undefined) tx.notes = data.notes;
  await tx.save();
  return tx;
}

export async function deleteTransaction(userId, id) {
  const tx = await Transaction.findOneAndDelete({ _id: id, user: userId });
  if (!tx) throw new ApiError(404, 'Transaction not found');
}
