import { AccountingPeriodDocument } from '@/lib/models/accountingPeriod.model';
import { UserAccountingPeriod } from '@/types/AccountingPeriod';

const toUserAccountingPeriod = (
  accountingPeriodDocument: AccountingPeriodDocument
): UserAccountingPeriod => {
  return {
    id: accountingPeriodDocument._id,
    name: accountingPeriodDocument.name,
    description: accountingPeriodDocument.description,
    startPeriod: accountingPeriodDocument.startPeriod,
    endPeriod: accountingPeriodDocument.endPeriod,
  } as UserAccountingPeriod;
};

export { toUserAccountingPeriod };
