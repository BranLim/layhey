import { createAsyncThunk } from '@reduxjs/toolkit';
import { FlowViewState } from '@/states/features/cashflow/flow.slice';
import { CashFlowState } from '@/states/features/cashflow/cashflow.slice';
import { UpdateTransactionRequest } from '@/types/Transaction';
import { updateTransactionApi } from '@/api/transactions.api';
import { getOverallCashFlowSummary } from '@/states/features/cashflow/getOverallCashFlowSummary.thunk';

export const updateTransaction = createAsyncThunk<
  void,
  UpdateTransactionRequest,
  { state: { cashflow: CashFlowState; flow: FlowViewState } }
>(
  'caashflow/updateTransaction',
  async (
    transaction: UpdateTransactionRequest,
    { dispatch, getState }
  ): Promise<void> => {
    try {
      const updatedTransaction = await updateTransactionApi(transaction);

      let currentState = getState();

      const expenseStartPeriod: string =
        currentState.cashflow.overallCashFlowForPeriod.startPeriod;
      const expenseEndPeriod: string =
        currentState.cashflow.overallCashFlowForPeriod.endPeriod;

      dispatch(
        getOverallCashFlowSummary({
          startPeriod: expenseStartPeriod,
          endPeriod: expenseEndPeriod,
          parentNodeId: '',
          parentStatementSlotId: '',
          reset: false,
        })
      );
    } catch (error) {}
  }
);
