import mongoose, { Schema, models } from 'mongoose';

const accountingPeriodSchema = new Schema({
  periodStart: String,
  periodEnd: String,
  description: String,
});
const AccountingPeriodModel =
  models.AccountingPeriod ||
  mongoose.model(
    'AccountingPeriod',
    accountingPeriodSchema,
    'accounting-periods'
  );

export { AccountingPeriodModel };
