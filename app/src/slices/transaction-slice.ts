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
    startPeriod: string;
    endPeriod: string;
    inflow: number;
    outflow: number;
    difference: number;
    currency: string;
  };
  income: Record<string, Income>;
  expense: Record<string, Expense>;
  status: string;
  error?: any;
}

const initialState = {
  budgetSummary: {
    startPeriod: '',
    endPeriod: '',
    inflow: 0,
    outflow: 0,
    difference: 0,
    currency: 'SGD',
  },
  income: {} as Record<string, Income>,
  expense: {} as Record<string, Expense>,
  status: 'idle',
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
      const response = await fetch(
        `${process.env.SERVER_URL}/transactions?startPeriod=${startPeriod}&endPeriod=${endPeriod}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json;charset=UTF-8',
          },
        }
      );
      if (!response.ok) {
        throw new Error(
          `Error get transactions for the period: ${startPeriod} - ${endPeriod}`
        );
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
      throw error;
    }
  }
);

const transactionSlice = createSlice({
  name: 'transaction',
  initialState,
  reducers: {
    setBudgetPeriod: (state, action) => {
      const { startPeriod, endPeriod } = action.payload;
      state.budgetSummary.startPeriod = startPeriod;
      state.budgetSummary.endPeriod = endPeriod;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getTransactions.pending, (state, action) => {
        state.status = 'loading';
        if (state.error) {
          state.error = undefined;
        }
      })
      .addCase(getTransactions.fulfilled, (state, action) => {
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

        state.budgetSummary.inflow = totalIncome;
        state.budgetSummary.outflow = totalExpense;
        state.budgetSummary.difference = totalIncome - totalExpense;
      })
      .addCase(getTransactions.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.error;
      });
  },
});

export const { setBudgetPeriod } = transactionSlice.actions;

export const selectBudgetInflow = (state: any) => state.inflow;
export const selectBudgetOutflow = (state: any) => state.outflow;
export const selectBudgetSummary = (state: any) => ({
  startPeriod: state.budgetSummary.startPeriod,
  endPeriod: state.budgetSummary.endPeriod,
  inflow: state.budgetSummary.inflow,
  outflow: state.budgetSummary.outflow,
  difference: state.budgetSummary.difference,
});

export default transactionSlice.reducer;
