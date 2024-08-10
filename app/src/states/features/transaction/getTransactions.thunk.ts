import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  setTransaction,
  setTransactions,
  TransactionViewState,
} from '@/states/features/transaction/transaction.slice';
import {
  SerializableTransaction,
  Transaction,
  TransactionQueryParams,
  TransactionResponse,
} from '@/types/Transaction';
import {
  getTransactionByIdApi,
  getTransactionsApi,
} from '@/api/transactions.api';
import { toFormattedDate } from '@/utils/date.utils';
import { getErrorMessage } from '@/utils/error.utils';

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

    const transactions: TransactionResponse[] = await getTransactionsApi(
      transactionSearchParams
    );
    dispatch(setTransactions(transactions));
  }
);

export const getTransactionById = createAsyncThunk<
  void,
  { id: string },
  { state: { transaction: TransactionViewState } }
>(
  'transaction/getTransactionById',
  async (
    request: {
      id: string;
    },
    { dispatch }
  ) => {
    const { id } = request;

    const transaction = await getTransactionByIdApi(id);
    if (transaction) {
      console.log('Found transaction to update');
      try {
        dispatch(
          setTransaction({
            ...transaction,
            date: new Date(transaction.date).toISOString() ?? '',
            createdOn: transaction.createdOn?.toISOString() ?? '',
            lastModifiedOn: transaction.lastModifiedOn?.toISOString() ?? '',
          })
        );
      } catch (error) {
        console.log(getErrorMessage);
        throw error;
      }
    }
  }
);
