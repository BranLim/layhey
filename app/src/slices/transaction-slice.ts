import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TransactionCategory, TransactionDto } from '@/types/Transaction';

interface Income {
  period: string;
  total: number;
}

interface Expense {
  period: string;
  total: number;
}

interface BudgetState {
  budgetSummary: {
    inflow: number;
    outflow: number;
    difference: number;
    currency: string;
  };
  income: Record<string, Income>;
  expense: Record<string, Expense>;
}

const initialState = {
  budgetSummary: {
    inflow: 0,
    outflow: 0,
    difference: 0,
    currency: 'SGD',
  },
  income: {} as Record<string, Income>,
  expense: {} as Record<string, Expense>,
} satisfies BudgetState as BudgetState;

export const getTransactions = createAsyncThunk(
  'transactions/request',
  async ({
    startPeriod,
    endPeriod,
  }: {
    startPeriod: string;
    endPeriod: string;
  }): Promise<TransactionDto[]> => {
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
  extraReducers: (builder) => {
    builder.addCase(getTransactions.fulfilled, (state, action) => {
      const { budgetSummary, income, expense } = state;
      const transactionDtos: TransactionDto[] = action.payload;
      const totalIncome = transactionDtos
        .filter(
          (transaction) => transaction.category == TransactionCategory.Income
        )
        .reduce((total, transaction) => total + transaction.amount, 0);

      const totalExpense = transactionDtos
        .filter(
          (transaction) => transaction.category == TransactionCategory.Expense
        )
        .reduce((total, transaction) => total + transaction.amount, 0);
      return {
        budgetSummary: {
          ...budgetSummary,
          inflow: totalIncome,
          outflow: totalExpense,
          difference: totalIncome - totalExpense,
        },
        income: { ...income },
        expense: { ...expense },
      };
    });
  },
});

export const selectBudgetInflow = (state: any) => state.inflow;
export const selectBudgetOutflow = (state: any) => state.outflow;

export default transactionSlice.reducer;
