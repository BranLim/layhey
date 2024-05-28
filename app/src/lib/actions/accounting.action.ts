import {
  AddAccountingPeriodRequest,
  UserAccountingPeriod,
} from '@/types/AccountingPeriod';
import { add, findAll } from '@/lib/repositories/accountingPeriod.repository';

const addAccountingPeriod = async (
  addAccountingPeriodRequest: AddAccountingPeriodRequest
): Promise<UserAccountingPeriod> => {
  const { name, description, startPeriod, endPeriod } =
    addAccountingPeriodRequest.data;
  const addedAccountingPeriod = await add({
    id: '',
    name: name,
    description: description,
    startPeriod: new Date(startPeriod),
    endPeriod: new Date(endPeriod),
  });
  return {
    ...addedAccountingPeriod,
  };
};

const getAccountingPeriods = async (): Promise<UserAccountingPeriod[]> => {
  const addedAccountingPeriod = await findAll();
  return {
    ...addedAccountingPeriod,
  };
};

export { addAccountingPeriod, getAccountingPeriods };
