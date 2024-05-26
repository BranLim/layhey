import {
  AccountingPeriod,
  AddAccountingPeriodRequest,
  UserAccountingPeriod,
} from '@/types/AccountingPeriod';
import { add } from '@/lib/repositories/accountingPeriod.repository';

const addAccountPeriod = async (
  addAccountingPeriod: AddAccountingPeriodRequest
): Promise<UserAccountingPeriod> => {
  const addedAccountingPeriod = await add(addAccountingPeriod.data);
  return {
    ...addedAccountingPeriod,
  };
};
