import { UserAccountingPeriod } from '@/types/AccountingPeriod';
import { connectMongo } from '@/database/mongodb';
import { AccountingPeriodModel } from '@/lib/models/accountingPeriod.model';
import { toUserAccountingPeriod } from '@/lib/mappers/accountingPeriod.mapper';

const add = async (
  accountingPeriod: UserAccountingPeriod
): Promise<UserAccountingPeriod> => {
  await connectMongo();

  const newAccountingPeriod = new AccountingPeriodModel({
    name: accountingPeriod.name,
    description: accountingPeriod.description,
    startPeriod: accountingPeriod.startPeriod,
    endPeriod: accountingPeriod.endPeriod,
  });
  await newAccountingPeriod.save();
  return toUserAccountingPeriod(newAccountingPeriod);
};

export { add };
