import { createAsyncThunk } from '@reduxjs/toolkit';
import { AddStatementPeriodRequest } from '@/types/StatementPeriod';
import { addStatementPeriodsApi } from '@/api/statementPeriods.api';
import {
  AccountingState,
  addStatementPeriod,
} from '@/states/features/accounting/accounting.slice';

export const addAccountingPeriod = createAsyncThunk<
  void,
  AddStatementPeriodRequest,
  { state: { accounting: AccountingState } }
>(
  'accounting/addAccountingPeriod',
  async (newStatementPeriod: AddStatementPeriodRequest, { dispatch }) => {
    const addedStatementPeriod =
      await addStatementPeriodsApi(newStatementPeriod);
    if (addedStatementPeriod) {
      dispatch(addStatementPeriod(addedStatementPeriod));
    }
  }
);
