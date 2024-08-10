import { createAsyncThunk } from '@reduxjs/toolkit';
import { GetUserAccountingPeriodsResponse } from '@/types/StatementPeriod';
import { getErrorMessage } from '@/utils/error.utils';
import { getStatementPeriodApi } from '@/api/statementPeriods.api';
import {
  AccountingState,
  setStatementPeriods,
} from '@/states/features/accounting/accounting.slice';

export const getAccountingPeriods = createAsyncThunk<
  void,
  void,
  { state: { accounting: AccountingState } }
>(
  'accounting/getAccountingPeriods',
  async (args, { dispatch }): Promise<any> => {
    console.log('Called getStatementPeriods');
    try {
      const statementPeriodResponse = await getStatementPeriodApi();
      if (statementPeriodResponse) {
        const statementPeriods = statementPeriodResponse.statementPeriods;
        dispatch(setStatementPeriods(statementPeriods));
      }
    } catch (error) {
      console.error(getErrorMessage(error));
      throw error;
    }
  }
);
