import mongoose, { Schema, models } from 'mongoose';

const budgetSchema = new Schema({
  periodStart: String,
  periodEnd: String,
  description: String,
});

const transactionSchema = new Schema({
  category: String,
  transactionType: String,
  amount: Number,
  currency: String,
  date: Date,
  budget: {
    type: Schema.Types.ObjectId,
    ref: 'Budget',
    required: false,
  },
});

const TransactionModel =
  models.Transaction ||
  mongoose.model('Transaction', transactionSchema, 'transactions');
const BudgetModel =
  models.Budget || mongoose.model('Budget', budgetSchema, 'budgets');

export { TransactionModel, BudgetModel };
