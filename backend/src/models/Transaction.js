import mongoose from 'mongoose';
import { TRANSACTION_TYPES, PAYMENT_METHODS } from '../utils/constants.js';
import { moneyToJSON } from '../utils/money.js';

const transactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: TRANSACTION_TYPES, required: true },
    // INTEGER minor units (paisa). Serialised to major units in toJSON.
    amount: {
      type: Number,
      required: true,
      min: [1, 'Amount must be greater than 0'],
      validate: { validator: Number.isInteger, message: 'Amount must be an integer number of minor units' },
    },
    category: { type: String, required: true, trim: true, maxlength: 50 },
    description: { type: String, trim: true, maxlength: 200, default: '' },
    paymentMethod: { type: String, enum: PAYMENT_METHODS, default: 'Cash' },
    date: { type: Date, required: true },
    notes: { type: String, trim: true, maxlength: 1000, default: '' },
  },
  { timestamps: true, toJSON: moneyToJSON }
);

// Every query is scoped by user first; these cover list/filter/sort and analytics.
transactionSchema.index({ user: 1, date: -1 });
transactionSchema.index({ user: 1, type: 1, date: -1 });
transactionSchema.index({ user: 1, category: 1, date: -1 });
transactionSchema.index({ user: 1, amount: -1 });

export default mongoose.model('Transaction', transactionSchema);
