import {
  AddAccountingPeriodRequest,
  UserAccountingPeriod,
} from '@/types/StatementPeriod';
import { add, findAll } from '@/lib/repositories/accountingPeriod.repository';
import { getErrorMessage } from '@/utils/error.utils';

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
  try {
    const addedAccountingPeriod = await findAll();
    if (addedAccountingPeriod) {
      console.log(`Found ${addedAccountingPeriod.length} accounting periods`);
    }
    return addedAccountingPeriod;
  } catch (error) {
    console.log(`Error loading accounting periods. ${getErrorMessage(error)}`);
    throw error;
  }
};

export { addAccountingPeriod, getAccountingPeriods };
