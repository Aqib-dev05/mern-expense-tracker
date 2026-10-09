import mongoose from 'mongoose';
import { BUDGET_PERIODS } from '../utils/constants.js';
import { moneyToJSON } from '../utils/money.js';

const budgetSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: String, required: true, trim: true },
    amount: {
      type: Number,
      required: true,
      min: [1, 'Budget amount must be greater than 0'],
      validate: { validator: Number.isInteger, message: 'Amount must be an integer number of minor units' },
    },
    period: { type: String, enum: BUDGET_PERIODS, required: true },
    startDate: { type: Date, required: true },
    // Inclusive last day of the budget window (UTC midnight)
    endDate: { type: Date, required: true },
  },
  { timestamps: true, toJSON: moneyToJSON }
);

budgetSchema.index({ user: 1, category: 1, startDate: 1, endDate: 1 });
budgetSchema.index({ user: 1, endDate: -1 });

export default mongoose.model('Budget', budgetSchema);
