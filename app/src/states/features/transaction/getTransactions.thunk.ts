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
  { startPeriod: string; endPeriod: string },
  { state: { transaction: TransactionViewState } }
>(
  'transaction/getTransactions',
  async (request: { startPeriod: string; endPeriod: string }, { dispatch }) => {
    const { startPeriod, endPeriod } = request;

    const transactions: TransactionResponse[] = await getTransactions(
      startPeriod,
      endPeriod
    );
    dispatch(setTransactions(transactions));
  }
);
