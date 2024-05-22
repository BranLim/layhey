import { Transaction } from '@/types/Transaction';
import mongoose, { Schema, models } from 'mongoose';

export type TransactionDocument = Transaction & mongoose.Document;

const transactionSchema = new Schema<TransactionDocument>({
  category: {
    type: String,
    required: true,
  },
  transactionType: String,
  transactionSource: String,
  amount: {
    type: Number,
    required: true,
  },
  currency: String,
  date: {
    type: Date,
    required: true,
  },
  createdOn: {
    type: Date,
    required: true,
    default: Date.now,
  },
  lastModifiedOn: {
    type: Date,
    default: Date.now,
  },
});

transactionSchema.pre<TransactionDocument>('save', function (next) {
  if (this.isNew) {
    this.createdOn = new Date(Date.now());
  }
  this.lastModifiedOn = new Date(Date.now());
  next();
});

transactionSchema.pre('findOneAndUpdate', function (next) {
  this.set({ lastModifiedOn: new Date(Date.now()) });
  next();
});

transactionSchema.pre('updateMany', function (next) {
  this.set({ lastModifiedOn: new Date(Date.now()) });
  next();
});

const TransactionModel =
  models.Transaction ||
  mongoose.model('Transaction', transactionSchema, 'transactions');

export { TransactionModel };
