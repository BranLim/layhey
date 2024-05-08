import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { TransactionCategory, TransactionDto } from '@/types/Transaction';

interface BudgetState {
  budgetSummary: {
    inflow: number;
    outflow: number;
    currency: string;
  };
  refreshData: boolean;
}

const initialState = {
  budgetSummary: {
    inflow: 0,
    outflow: 0,
    currency: 'SGD',
  },
  refreshData: false,
} satisfies BudgetState as BudgetState;

export const getTransactions = createAsyncThunk(
  'transactions/request',
  async () => {
    try {
      const response = await fetch(`${process.env.SERVER_URL}/transactions`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
      });
      if (!response.ok) {
        return [] as TransactionDto[];
      }
      const foundTransactions = await response.json();
      return foundTransactions.map((transaction: any) => {
        return {
          id: transaction.id,
          date: transaction.date,
          currency: transaction.currency,
          amount: transaction.amount,
          category: transaction.category,
          transactionType: transaction.transactionType,
        } as TransactionDto;
      });
    } catch (error) {
      console.error(error);
      return [] as TransactionDto[];
    }
  }
);

const transactionSlice = createSlice({
  name: 'transaction',
  initialState,
  reducers: {},
});

export default transactionSlice.reducer;
