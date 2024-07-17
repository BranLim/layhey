import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  setTransactions,
  TransactionViewState,
} from '@/states/features/transaction/transaction.slice';
import {
  SerializableTransaction,
  Transaction,
  TransactionQueryParams,
  TransactionResponse,
} from '@/types/Transaction';
import { getTransactions } from '@/states/features/cashflow/api/transactions.api';
import { toFormattedDate } from '@/utils/date.utils';

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

    let transactionSearchParams: TransactionQueryParams = {
      startPeriod: toFormattedDate(new Date(startPeriod), 'yyyy-MM-dd'),
      endPeriod: toFormattedDate(new Date(endPeriod), 'yyyy-MM-dd'),
    };
    if (transactionType) {
      transactionSearchParams['mode'] = transactionType;
    }

    const transactions: TransactionResponse[] = await getTransactions(
      transactionSearchParams
    );
    dispatch(setTransactions(transactions));
  }
);
