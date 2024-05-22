import mongoose, { Schema, models, Model } from 'mongoose';
import { UserAccountingPeriod } from '@/types/AccountingPeriod';

export type AccountingPeriodDocument = UserAccountingPeriod & Document;

export type AccountingPeriodModel = Model<AccountingPeriodDocument>;

const accountingPeriodSchema = new Schema<AccountingPeriodDocument>({
  name: {
    type: String,
    required: true,
  },
  description: String,
  startPeriod: {
    type: String,
    required: true,
  },
  endPeriod: {
    type: String,
    required: true,
  },
});
const AccountingPeriod: AccountingPeriodModel =
  models.AccountingPeriod ||
  mongoose.model<AccountingPeriodDocument, AccountingPeriodModel>(
    'AccountingPeriod',
    accountingPeriodSchema,
    'accountingPeriods'
  );

export { AccountingPeriod };
