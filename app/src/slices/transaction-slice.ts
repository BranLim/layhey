import {
  createAsyncThunk,
  createSelector,
  createSlice,
} from '@reduxjs/toolkit';
import {
  Transaction,
  TransactionCategory,
  TransactionDto,
  TransactionResponse,
} from '@/types/Transaction';
import { BudgetSummary } from '@/types/Budget';
import {
  isTransactionDateWithin,
  toFormattedDate,
  toTransactionMonth,
} from '@/utils/date-utils';

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
    startPeriod: undefined,
    endPeriod: undefined,
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
      startPeriod: Date;
      endPeriod: Date;
    },
    { rejectWithValue }
  ) => {
    try {
      const formattedStartPeriod = toFormattedDate(startPeriod, 'yyyy-MM-dd');
      const formattedEndPeriod = toFormattedDate(endPeriod, 'yyyy-MM-dd');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/transactions?startPeriod=${formattedStartPeriod}&endPeriod=${formattedEndPeriod}`,
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
      return foundTransactions;
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
      state.budgetSummary.startPeriod = new Date(startPeriod);
      state.budgetSummary.endPeriod = new Date(endPeriod);
    },
    addTransaction: (state, action) => {
      const { date, category, amount } = action.payload;
      console.log(`Transaction Detail: ${date}, ${category}, ${amount}`);
      const budgetStartPeriod = state.budgetSummary.startPeriod;
      const budgetEndPeriod = state.budgetSummary.endPeriod;

      if (!budgetStartPeriod || !budgetEndPeriod) {
        return;
      }

      if (isTransactionDateWithin(date, budgetStartPeriod, budgetEndPeriod)) {
        const transactionMonthKey = toTransactionMonth(date);
        switch (category) {
          case TransactionCategory.Income:
            console.log('Updating income');

            const currentIncome = state.income[transactionMonthKey];
            const updatedIncome = {
              period: transactionMonthKey,
              total: currentIncome ? currentIncome.total + amount : amount,
            };
            state.income[transactionMonthKey] = updatedIncome;
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

            const currentExpense = state.expense[transactionMonthKey];
            const updatedExpense = {
              period: transactionMonthKey,
              total: currentExpense ? currentExpense.total + amount : amount,
            };
            state.expense[transactionMonthKey] = updatedExpense;
            console.log(JSON.stringify(updatedExpense));

            let totalExpense = 0;
            for (const expenseMonth in state.expense) {
              const expense = state.expense[expenseMonth];
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
        state.income = {};
        state.expense = {};
        if (state.error) {
          state.error = undefined;
        }
      })
      .addCase(getTransactions.fulfilled, (state, action) => {
        const transactionDtos: TransactionResponse[] = action.payload;

        let totalIncome = 0;
        let totalExpense = 0;
        try {
          transactionDtos?.forEach((transaction) => {
            const transactionMonth = toTransactionMonth(
              new Date(transaction.date)
            );

            switch (transaction.category) {
              case TransactionCategory.Income:
                if (!state.income[transactionMonth]) {
                  state.income[transactionMonth] = {
                    period: transactionMonth,
                    total: transaction.amount,
                  };
                } else {
                  state.income[transactionMonth].total =
                    state.income[transactionMonth].total + transaction.amount;
                }
                totalIncome += transaction.amount;
                break;
              case TransactionCategory.Expense:
                if (!state.expense[transactionMonth]) {
                  state.expense[transactionMonth] = {
                    period: transactionMonth,
                    total: transaction.amount,
                  };
                } else {
                  state.expense[transactionMonth].total =
                    state.expense[transactionMonth].total + transaction.amount;
                }

                totalExpense += transaction.amount;
                break;
            }
          });
        } catch (error) {
          state.error = error;
        }

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
export const selectHasError = (state: any) => !!state.transaction.error;
export const selectError = (state: any) => state.transaction.error;
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
