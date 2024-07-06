import { createAsyncThunk } from '@reduxjs/toolkit';
import CashFlow from '@/types/CashFlow';
import {
  setTransactions,
  TransactionViewState,
} from '@/states/features/transaction/transaction.slice';
import {
  SerializableTransaction,
  Transaction,
  TransactionResponse,
} from '@/types/Transaction';
import { getTransactions } from '@/lib/actions/transaction.action';

export const getTransactionsForPeriod = createAsyncThunk<
  void,
  CashFlow.GetTransactionRequest,
  { state: { transaction: TransactionViewState } }
>(
  'transaction/getTransactions',
  async (request: CashFlow.GetTransactionRequest, { dispatch }) => {
    const { startPeriod, endPeriod } = request;

    const transactions: Transaction[] = await getTransactions(
      startPeriod,
      endPeriod
    );

    const transactionDtos = transactions.map((transaction) => {
      return {
        id: transaction.id,
        mode: transaction.mode,
        transactionCategory: transaction.transactionCategory,
        amount: transaction.amount,
        transactionSource: transaction.transactionSource,
        date: transaction.date.toISOString(),
        currency: transaction.currency,
        createdOn: transaction.createdOn?.toISOString(),
        lastModifiedOn: transaction.lastModifiedOn?.toISOString(),
      } as SerializableTransaction;
    });

    dispatch(setTransactions(transactionDtos));
  }
);
