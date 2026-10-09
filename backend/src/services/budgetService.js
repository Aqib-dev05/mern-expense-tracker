import Budget from '../models/Budget.js';
import Transaction from '../models/Transaction.js';
import ApiError from '../utils/ApiError.js';
import { toMinor, fromMinor } from '../utils/money.js';
import { parseDateOnly, addDays, addMonths, startOfMonth, todayUTC } from '../utils/dates.js';

const WARNING_AT = 80;
const EXCEEDED_AT = 100;

const defaultStart = (period) => {
  const t = todayUTC();
  if (period === 'monthly') return startOfMonth(t);
  if (period === 'yearly') return new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return t;
};

const computeEnd = (period, start, customEnd) => {
  switch (period) {
    case 'weekly': return addDays(start, 6);
    case 'monthly': return addDays(addMonths(start, 1), -1);
    case 'yearly': return addDays(addMonths(start, 12), -1);
    default: return customEnd;
  }
};

async function assertNoOverlap(userId, { category, startDate, endDate }, excludeId) {
  const q = { user: userId, category, startDate: { $lte: endDate }, endDate: { $gte: startDate } };
  if (excludeId) q._id = { $ne: excludeId };
  if (await Budget.exists(q)) {
    throw new ApiError(409, `A ${category} budget already exists for an overlapping period`);
  }
}

async function spentMinor(b) {
  const [row] = await Transaction.aggregate([
    {
      $match: {
        user: b.user,
        type: 'expense',
        category: b.category,
        date: { $gte: b.startDate, $lt: addDays(b.endDate, 1) },
      },
    },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  return row?.total ?? 0;
}

async function withProgress(budget) {
  const spent = await spentMinor(budget);
  const percentage = Math.round((spent / budget.amount) * 1000) / 10;
  const status = percentage >= EXCEEDED_AT ? 'exceeded' : percentage >= WARNING_AT ? 'warning' : 'ok';
  return {
    ...budget.toJSON(),
    spent: fromMinor(spent),
    remaining: fromMinor(budget.amount - spent), // negative when exceeded
    percentage,
    status,
  };
}

export async function listBudgets(userId, { active } = {}) {
  const filter = { user: userId };
  if (active === 'true') {
    const today = todayUTC();
    filter.startDate = { $lte: today };
    filter.endDate = { $gte: today };
  }
  const budgets = await Budget.find(filter).sort({ endDate: -1, createdAt: -1 });
  return Promise.all(budgets.map(withProgress));
}

export async function createBudget(userId, data) {
  const startDate = data.startDate ? parseDateOnly(data.startDate) : defaultStart(data.period);
  const endDate = computeEnd(data.period, startDate, data.endDate ? parseDateOnly(data.endDate) : null);
  if (!endDate || endDate < startDate) throw new ApiError(400, 'End date must be on or after the start date');

  await assertNoOverlap(userId, { category: data.category, startDate, endDate });
  const budget = await Budget.create({
    user: userId, category: data.category, amount: toMinor(data.amount), period: data.period, startDate, endDate,
  });
  return withProgress(budget);
}

export async function updateBudget(userId, id, data) {
  const budget = await Budget.findOne({ _id: id, user: userId });
  if (!budget) throw new ApiError(404, 'Budget not found');

  const period = data.period ?? budget.period;
  const category = data.category ?? budget.category;
  const startDate = data.startDate ? parseDateOnly(data.startDate) : budget.startDate;
  const customEnd = data.endDate ? parseDateOnly(data.endDate) : period === 'custom' ? budget.endDate : null;
  const endDate = computeEnd(period, startDate, customEnd);
  if (!endDate || endDate < startDate) throw new ApiError(400, 'End date must be on or after the start date');

  await assertNoOverlap(userId, { category, startDate, endDate }, budget._id);

  Object.assign(budget, { category, period, startDate, endDate });
  if (data.amount !== undefined) budget.amount = toMinor(data.amount);
  await budget.save();
  return withProgress(budget);
}

export async function deleteBudget(userId, id) {
  const budget = await Budget.findOneAndDelete({ _id: id, user: userId });
  if (!budget) throw new ApiError(404, 'Budget not found');
}
