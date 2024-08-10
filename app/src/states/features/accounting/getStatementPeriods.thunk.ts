import { createAsyncThunk } from '@reduxjs/toolkit';
import { GetUserAccountingPeriodsResponse } from '@/types/StatementPeriod';
import { getErrorMessage } from '@/utils/error.utils';

export const getAccountingPeriods = createAsyncThunk(
  'accounting/getAccountingPeriods',
  async (args, { rejectWithValue }): Promise<any> => {
    console.log('Called getStatementPeriods');
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
        return rejectWithValue(response.statusText);
      }
      const userAccountingPeriodResponse =
        (await response.json()) as GetUserAccountingPeriodsResponse;
      console.log(`Got ${userAccountingPeriodResponse} `);

      return userAccountingPeriodResponse;
    } catch (error) {
      console.error(getErrorMessage(error));
      throw error;
    }
  }
);
