import {
  AddAccountingPeriodRequest,
  UserAccountingPeriodResponse,
} from '@/types/StatementPeriod';

export const addStatementPeriodsApi = async (
  newAccountingPeriod: AddAccountingPeriodRequest
): Promise<UserAccountingPeriodResponse> => {
  const apiPath = `${process.env.NEXT_PUBLIC_SERVER_URL}/api/accountingperiods`;
  const response = await fetch(apiPath, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(newAccountingPeriod),
  });

  if (!response.ok) {
    throw new Error('Error adding new transaction');
  }
  const userAccountingPeriod =
    (await response.json()) as UserAccountingPeriodResponse;
  return userAccountingPeriod;
};
