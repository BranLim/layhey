import { Transaction, TransactionCategory } from '@/types/Transaction';
import mongoose, { Model, models, Schema } from 'mongoose';

export type TransactionCategoryDocument = Omit<TransactionCategory, 'id'> &
  mongoose.Document;
export type TransactionCategoryDocumentModel =
  Model<TransactionCategoryDocument>;

const transactionCategorySchema = new Schema<TransactionCategoryDocument>({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
});

const TransactionCategoryModel: TransactionCategoryDocumentModel =
  models.TransactionCategory ||
  mongoose.model<TransactionCategoryDocument, TransactionCategoryDocumentModel>(
    'TransactionCategory',
    transactionCategorySchema,
    'transactionCategories'
  );

export type TransactionDocument = Omit<Transaction, 'id'> & mongoose.Document;
export type TransactionDocumentModel = Model<TransactionDocument>;

const transactionSchema = new Schema<TransactionDocument>({
  mode: {
    type: String,
    required: true,
  },
  transactionCategory: String,
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
/*
transactionSchema.pre<TransactionDocument>('insertMany', function (next) {
  this.set({ lastModifiedOn: new Date(Date.now()) });
  next();
});
*/

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

const TransactionModel: TransactionDocumentModel =
  models.Transaction ||
  mongoose.model<TransactionDocument, TransactionDocumentModel>(
    'Transaction',
    transactionSchema,
    'transactions'
  );

export { TransactionModel, TransactionCategoryModel };
