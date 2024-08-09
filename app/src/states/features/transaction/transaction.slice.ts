import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  SerializableTransaction,
  TransactionDto,
  UpdateTransactionEvent,
} from '@/types/Transaction';
import { Draft } from 'immer';

export type TransactionViewState = {
  transactions: SerializableTransaction[];
  selectedTransaction?: SerializableTransaction;
};

const initialState: TransactionViewState = {
  transactions: [] as SerializableTransaction[],
  selectedTransaction: undefined,
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
    updateTransaction: (
      state: Draft<TransactionViewState>,
      action: PayloadAction<UpdateTransactionEvent>
    ) => {},
    setTransaction: (
      state: Draft<TransactionViewState>,
      action: PayloadAction<SerializableTransaction>
    ) => {
      const transaction = action.payload;
      state.selectedTransaction = transaction;
    },
  },
});

export const { setTransactions, setTransaction } = transactionSlice.actions;
export const selectTransactions = (state: any): SerializableTransaction[] =>
  state.transaction.transactions;

export default transactionSlice.reducer;
