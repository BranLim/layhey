import {
  createAsyncThunk,
  createSelector,
  createSlice,
} from '@reduxjs/toolkit';
import { TransactionCategory, TransactionDto } from '@/types/Transaction';
import { toDate, toPeriod } from '@/utils/transaction-period-date-formatter';
import { RootState } from '@/lib/store';
import { BudgetSummary } from '@/types/Budget';

const periodFormat = 'yyyy-MM-dd';

interface Income {
  period: string;
  total: number;
}

interface Expense {
  period: string;
  total: number;
}

export interface BudgetState {
  budgetSummary: BudgetSummary & {
    currency: string;
  };
  income: { [key: string]: Income };
  expense: { [key: string]: Expense };
  status: string;
  error?: any;
}

const initialState: BudgetState = {
  budgetSummary: {
    startPeriod: '',
    endPeriod: '',
    inflow: 0,
    outflow: 0,
    difference: 0,
    currency: 'SGD',
  },
  income: {},
  expense: {},
  status: 'idle',
};

export const getTransactions = createAsyncThunk(
  'transactions/getTransactions',
  async (
    {
      startPeriod,
      endPeriod,
    }: {
      startPeriod: string;
      endPeriod: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/transactions?startPeriod=${startPeriod}&endPeriod=${endPeriod}`,
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
    } catch (error: any) {
      console.error(error);
      return rejectWithValue(error.message);
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
    addTransaction: (state, action) => {
      const { date, category, amount } = action.payload;
      console.log(`Transaction Detail: ${date}, ${category}, ${amount}`);
      const budgetStartPeriod = toDate(
        state.budgetSummary.startPeriod,
        periodFormat
      );
      const budgetEndPeriod = toDate(
        state.budgetSummary.endPeriod,
        periodFormat
      );
      const transactionDate = toDate(date, 'yyyy-MM-dd');
      if (
        transactionDate.getUTCFullYear() >=
          budgetStartPeriod.getUTCFullYear() &&
        transactionDate.getUTCFullYear() <= budgetEndPeriod.getUTCFullYear()
      ) {
        const transactionPeriod = toPeriod(date, 'yyyy-MM');
        switch (category) {
          case TransactionCategory.Income:
            console.log('Updating income');

            const currentIncome = state.income[transactionPeriod];
            const updatedIncome = {
              period: transactionPeriod,
              total: currentIncome ? currentIncome.total + amount : amount,
            };
            state.income[transactionPeriod] = updatedIncome;
            console.log(JSON.stringify(updatedIncome));

            let totalIncome = 0;
            for (const key in state.income) {
              const income = state.income[key];
              totalIncome += income.total;
            }
            state.budgetSummary.inflow = totalIncome;
            break;
          case TransactionCategory.Expense:
            console.log('Updating expense');

            const currentExpense = state.expense[transactionPeriod];
            const updatedExpense = {
              period: transactionPeriod,
              total: currentExpense ? currentExpense.total + amount : amount,
            };
            state.expense[transactionPeriod] = updatedExpense;
            console.log(JSON.stringify(updatedExpense));

            let totalExpense = 0;
            for (const key in state.expense) {
              const expense = state.expense[key];
              totalExpense += expense.total;
            }
            console.log(`Total Expense: ${totalExpense}`);
            state.budgetSummary.outflow = totalExpense;
            break;
        }
        state.budgetSummary.difference =
          state.budgetSummary.inflow - state.budgetSummary.outflow;
      }
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
        const transactionDtos: TransactionDto[] = action.payload;
        const incomeTransactions = transactionDtos.filter(
          (transaction) => transaction.category == TransactionCategory.Income
        );
        const expenseTransactions = transactionDtos.filter(
          (transaction) => transaction.category == TransactionCategory.Expense
        );

        let totalIncome = 0;
        incomeTransactions.forEach((transaction) => {
          const transactionPeriod = toPeriod(transaction.date, 'yyyy-MM');
          if (!state.income[transactionPeriod]) {
            state.income[transactionPeriod] = {
              period: transactionPeriod,
              total: transaction.amount,
            };
          } else {
            state.income[transactionPeriod].total =
              state.income[transactionPeriod].total + transaction.amount;
          }

          totalIncome += transaction.amount;
        });

        let totalExpense = 0;
        expenseTransactions.forEach((transaction) => {
          const transactionPeriod = toPeriod(transaction.date, 'yyyy-MM');
          if (!state.expense[transactionPeriod]) {
            state.expense[transactionPeriod] = {
              period: transactionPeriod,
              total: transaction.amount,
            };
          } else {
            state.expense[transactionPeriod].total =
              state.expense[transactionPeriod].total + transaction.amount;
          }

          totalExpense += transaction.amount;
        });

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

export const { setBudgetPeriod, addTransaction } = transactionSlice.actions;
export const selectBudgetPeriod = createSelector(
  (state: any) => state.transaction.budgetSummary,
  (budgetSummary) => ({
    startPeriod: budgetSummary.startPeriod,
    endPeriod: budgetSummary.endPeriod,
  })
);
export const selectBudgetInflow = (state: any) => state.transaction.inflow;
export const selectBudgetOutflow = (state: any) => state.transaction.outflow;
export const selectBudgetSummary = createSelector(
  (state: any) => state.transaction.budgetSummary,
  (budgetSummary) => ({
    startPeriod: budgetSummary.startPeriod,
    endPeriod: budgetSummary.endPeriod,
    inflow: budgetSummary.inflow,
    outflow: budgetSummary.outflow,
    difference: budgetSummary.difference,
  })
);

export default transactionSlice.reducer;
