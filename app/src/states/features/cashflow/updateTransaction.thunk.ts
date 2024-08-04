import { createAsyncThunk } from '@reduxjs/toolkit';
import { FlowViewState } from '@/states/features/cashflow/flow.slice';
import { CashFlowState } from '@/states/features/cashflow/cashflow.slice';
import { UpdateTransactionRequest } from '@/types/Transaction';
import { updateTransactionApi } from '@/api/transactions.api';

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
    const updatedTransaction = await updateTransactionApi(transaction);
  }
);
