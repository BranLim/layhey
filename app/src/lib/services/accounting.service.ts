import {
  AddStatementPeriodRequest,
  UserStatementPeriod,
} from '@/types/StatementPeriod';
import { add, findAll } from '@/lib/repositories/accountingPeriod.repository';
import { getErrorMessage } from '@/utils/error.utils';

const addAccountingPeriod = async (
  addAccountingPeriodRequest: AddStatementPeriodRequest
): Promise<UserStatementPeriod> => {
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

const getAccountingPeriods = async (): Promise<UserStatementPeriod[]> => {
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
