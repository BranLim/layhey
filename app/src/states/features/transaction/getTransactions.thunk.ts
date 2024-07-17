import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  setTransactions,
  TransactionViewState,
} from '@/states/features/transaction/transaction.slice';
import {
  SerializableTransaction,
  Transaction,
  TransactionResponse,
} from '@/types/Transaction';
import { getTransactions } from '@/states/features/cashflow/api/transactions.api';

export const getTransactionsForPeriod = createAsyncThunk<
  void,
  { startPeriod: string; endPeriod: string; transactionType?: string },
  { state: { transaction: TransactionViewState } }
>(
  'transaction/getTransactions',
  async (
    request: {
      startPeriod: string;
      endPeriod: string;
      transactionType?: string;
    },
    { dispatch }
  ) => {
    const { startPeriod, endPeriod, transactionType } = request;

    const transactions: TransactionResponse[] = await getTransactions(
      startPeriod,
      endPeriod,
      transactionType
    );
    dispatch(setTransactions(transactions));
  }
);
