/**
 * DEVELOPMENT-ONLY demo data.  Usage: npm run seed
 * Creates/refreshes ONE demo user (demo@expensetracker.dev / Demo@12345) with sample
 * transactions and budgets. It never touches any other user and refuses to run in production.
 */
import env from '../config/env.js';
import { connectDB, disconnectDB } from '../config/db.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import Budget from '../models/Budget.js';
import { addDays, addMonths, startOfMonth, todayUTC } from '../utils/dates.js';

if (env.isProd) {
  console.error('Refusing to seed demo data when NODE_ENV=production.');
  process.exit(1);
}

const DEMO = { name: 'Demo User', email: 'demo@expensetracker.dev', password: 'Demo@12345', currency: 'PKR' };

// Deterministic PRNG so repeated seeds look the same.
const rng = (seed) => () => {
  seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const rand = rng(2026);
const pick = (a) => a[Math.floor(rand() * a.length)];
const between = (min, max) => Math.round(min + rand() * (max - min));

const EXPENSES = [
  ['Food', ['Groceries', 'Lunch', 'Dinner out', 'Tea & snacks'], 400, 4500],
  ['Transport', ['Fuel', 'Careem ride', 'Bus pass'], 300, 3500],
  ['Shopping', ['Clothes', 'Shoes', 'Accessories'], 1500, 12000],
  ['Bills', ['Electricity', 'Internet', 'Gas bill'], 2500, 14000],
  ['Health', ['Pharmacy', 'Doctor visit'], 500, 5000],
  ['Entertainment', ['Cinema', 'Games', 'Outing'], 800, 4500],
  ['Subscriptions', ['Netflix', 'Spotify'], 600, 1800],
  ['Education', ['Books', 'Online course'], 1000, 8000],
];
const METHODS = ['Cash', 'Bank', 'Debit Card', 'JazzCash', 'Easypaisa', 'Credit Card'];

async function run() {
  await connectDB();
  const prior = await User.findOne({ email: DEMO.email });
  if (prior) { await Transaction.deleteMany({ user: prior._id }); await Budget.deleteMany({ user: prior._id }); await prior.deleteOne(); }

  const user = await User.create(DEMO);
  const today = todayUTC();
  const docs = [];

  for (let m = 5; m >= 0; m--) {
    const first = addMonths(startOfMonth(today), -m);
    const lastDay = m === 0 ? today : addDays(addMonths(first, 1), -1);
    const days = Math.round((lastDay - first) / 86400000) + 1;

    docs.push({ type: 'income', category: 'Salary', description: 'Monthly salary', amount: 120000 * 100, paymentMethod: 'Bank', date: first });
    if (rand() > 0.4) {
      docs.push({ type: 'income', category: 'Freelance', description: 'Freelance project', amount: between(15000, 45000) * 100, paymentMethod: 'Bank', date: addDays(first, Math.min(days - 1, between(5, 20))) });
    }
    docs.push({ type: 'expense', category: 'Rent', description: 'House rent', amount: 35000 * 100, paymentMethod: 'Bank', date: addDays(first, Math.min(days - 1, 2)) });

    const count = between(14, 20);
    for (let i = 0; i < count; i++) {
      const [category, names, min, max] = pick(EXPENSES);
      docs.push({
        type: 'expense', category, description: pick(names), amount: between(min, max) * 100,
        paymentMethod: pick(METHODS), date: addDays(first, between(0, days - 1)),
      });
    }
  }
  await Transaction.insertMany(docs.map((d) => ({ ...d, user: user._id })));

  const start = startOfMonth(today);
  const end = addDays(addMonths(start, 1), -1);
  await Budget.insertMany(
    [['Food', 15000], ['Shopping', 10000], ['Transport', 8000], ['Entertainment', 5000]].map(([category, amount]) => ({
      user: user._id, category, amount: amount * 100, period: 'monthly', startDate: start, endDate: end,
    }))
  );

  console.log(`Seeded ${docs.length} transactions and 4 budgets.`);
  console.log(`Login: ${DEMO.email} / ${DEMO.password}`);
  await disconnectDB();
}

run().catch(async (e) => { console.error(e); await disconnectDB(); process.exit(1); });
