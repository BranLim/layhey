import mongoose, { Schema, models, Model } from 'mongoose';
import { UserAccountingPeriod } from '@/types/AccountingPeriod';

export type AccountingPeriodDocument = UserAccountingPeriod & mongoose.Document;

export type AccountingPeriodModel = Model<AccountingPeriodDocument>;

const accountingPeriodSchema = new Schema<AccountingPeriodDocument>({
  name: {
    type: String,
    required: true,
  },
  description: String,
  startPeriod: {
    type: Date,
    required: true,
  },
  endPeriod: {
    type: Date,
    required: true,
  },
});
const AccountingPeriodModel: AccountingPeriodModel =
  models.AccountingPeriod ||
  mongoose.model<AccountingPeriodDocument, AccountingPeriodModel>(
    'AccountingPeriodModel',
    accountingPeriodSchema,
    'accountingPeriods'
  );

export { AccountingPeriodModel };
