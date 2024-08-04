import { createAsyncThunk } from '@reduxjs/toolkit';
import { AddAccountingPeriodRequest } from '@/types/StatementPeriod';
import { addStatementPeriodsApi } from '@/api/statementPeriods.api';
import { AccountingState } from '@/states/features/accounting/accounting.slice';

export const addAccountingPeriod = createAsyncThunk<
  void,
  AddAccountingPeriodRequest,
  { state: { accounting: AccountingState } }
>(
  'accounting/addAccountingPeriod',
  async (newAccountingPeriod: AddAccountingPeriodRequest, { getState }) => {
    const addedStatementPeriods =
      await addStatementPeriodsApi(newAccountingPeriod);
    const state = getState();
    state.accounting.accountingPeriods.push({
      ...addedStatementPeriods,
      startPeriod: addedStatementPeriods.startPeriod,
      endPeriod: addedStatementPeriods.endPeriod,
    });
  }
);
