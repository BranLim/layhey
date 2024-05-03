import mongoose, { Schema } from 'mongoose';

const budgetSchema = new Schema({
  periodStart: String,
  periodEnd: String,
  description: String,
});

const transactionSchema = new Schema(
  {
    category: String,
    amount: Number,
    currency: String,
    date: Date,
    budget: {
      type: Schema.Types.ObjectId,
      ref: 'Budget',
      required: false,
    },
  },
  { versionKey: '__v' }
);

const TransactionModel = mongoose.model(
  'Transaction',
  transactionSchema,
  'transactions'
);
const BudgetModel = mongoose.model('Budget', budgetSchema, 'budgets');

export { TransactionModel, BudgetModel };
