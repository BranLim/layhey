import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  SerializableTransaction,
  TransactionDto,
  UpdateTransactionEvent,
} from '@/types/Transaction';
import { Draft } from 'immer';
import { addTransaction } from '@/lib/services/transaction.service';
import { getTransactionById } from '@/states/features/transaction/getTransactions.thunk';

export type Status = 'pending' | 'inprogress' | 'done' | 'error';

export type TransactionViewState = {
  transactions: SerializableTransaction[];
  selectedTransaction?: SerializableTransaction;
  status?: Status;
};

const initialState: TransactionViewState = {
  transactions: [] as SerializableTransaction[],
  selectedTransaction: undefined,
  status: undefined,
};

const transactionSlice = createSlice({
  name: 'transaction',
  initialState: initialState,
  reducers: {
    setTransactions: (
      state: Draft<TransactionViewState>,
      action: PayloadAction<SerializableTransaction[]>
    ) => {
      const transactions = action.payload;
      const sortedTransaction = transactions.sort(
        (txn1, txn2) =>
          new Date(txn1.date).getTime() - new Date(txn2.date).getTime()
      );

      state.transactions.length = 0;
      state.transactions.push(...sortedTransaction);
    },
    setTransaction: (
      state: Draft<TransactionViewState>,
      action: PayloadAction<SerializableTransaction>
    ) => {
      const transaction = action.payload;
      state.selectedTransaction = transaction;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getTransactionById.rejected, (state, action) => {
        state.status = 'error';
      })
      .addCase(getTransactionById.pending, (state, action) => {
        state.status = 'pending';
      })
      .addCase(getTransactionById.fulfilled, (state, action) => {
        state.status = 'done';
      });
  },
});

export const updateTransaction = createAction<UpdateTransactionEvent>(
  'transaction/updateTransaction'
);
export const { setTransactions, setTransaction } = transactionSlice.actions;
export const selectTransactions = (state: any): SerializableTransaction[] =>
  state.transaction.transactions;
export const selectTransaction = (state: any): SerializableTransaction =>
  state.transaction.selectedTransaction;
export const selectTransactionLoadingStatus = (state: any): Status =>
  state.transaction.status;

export default transactionSlice.reducer;
