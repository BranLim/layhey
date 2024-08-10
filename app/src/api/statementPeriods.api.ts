import {
  AddStatementPeriodRequest,
  AddStatementPeriodResponse,
  GetUserAccountingPeriodsResponse,
  UserStatementPeriodResponse,
} from '@/types/StatementPeriod';
import { getErrorMessage } from '@/utils/error.utils';

export const addStatementPeriodsApi = async (
  newAccountingPeriod: AddStatementPeriodRequest
): Promise<AddStatementPeriodResponse | null> => {
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
    return null;
  }
  const userAccountingPeriod =
    (await response.json()) as AddStatementPeriodResponse;
  return userAccountingPeriod;
};

export const getStatementPeriodApi =
  async (): Promise<GetUserAccountingPeriodsResponse | null> => {
    try {
      const apiPath = `${process.env.NEXT_PUBLIC_SERVER_URL}/api/accountingperiods`;
      const response = await fetch(apiPath, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        return null;
      }
      const userAccountingPeriodResponse =
        (await response.json()) as GetUserAccountingPeriodsResponse;

      return userAccountingPeriodResponse;
    } catch (error) {
      console.log(getErrorMessage(error));
      throw error;
    }
  };
