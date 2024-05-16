import {
  createAsyncThunk,
  createSelector,
  createSlice,
} from '@reduxjs/toolkit';
import { TransactionCategory, TransactionResponse } from '@/types/Transaction';
import { CashFlowSummaryState, CashFlow } from '@/types/Budget';
import {
  isTransactionDateWithin,
  toFormattedDate,
  toAccountingMonth,
} from '@/utils/date-utils';

type CashFlowState = {
  cashFlowSummary: CashFlowSummaryState;
  income: { [key: string]: CashFlow };
  expense: { [key: string]: CashFlow };
  status: string;
  error?: any;
};

const initialState: CashFlowState = {
  cashFlowSummary: {
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
  'cashflow/getTransactions',
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
      const formattedStartPeriod = toFormattedDate(
        new Date(startPeriod),
        'yyyy-MM-dd'
      );
      const formattedEndPeriod = toFormattedDate(
        new Date(endPeriod),
        'yyyy-MM-dd'
      );
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

const cashFlowSlice = createSlice({
  name: 'cashflow',
  initialState,
  reducers: {
    setAccountingPeriod: (state, action) => {
      const { startPeriod, endPeriod } = action.payload;
      state.cashFlowSummary.startPeriod = new Date(startPeriod).toISOString();
      state.cashFlowSummary.endPeriod = new Date(endPeriod).toISOString();
    },
    addTransaction: (state, action) => {
      const { date, category, amount } = action.payload;
      console.log(`Transaction Detail: ${date}, ${category}, ${amount}`);
      const budgetStartPeriod: string = state.cashFlowSummary.startPeriod;
      const budgetEndPeriod: string = state.cashFlowSummary.endPeriod;

      if (!budgetStartPeriod || !budgetEndPeriod) {
        return;
      }

      const transactionDate = new Date(date);
      if (
        isTransactionDateWithin(
          transactionDate,
          new Date(budgetStartPeriod),
          new Date(budgetEndPeriod)
        )
      ) {
        const accountingMonth = toAccountingMonth(transactionDate);
        switch (category) {
          case TransactionCategory.Income:
            console.log('Updating income');

            const currentIncome = state.income[accountingMonth];
            const updatedIncome: CashFlow = {
              type: 'income',
              period: accountingMonth,
              total: currentIncome ? currentIncome.total + amount : amount,
            };
            state.income[accountingMonth] = updatedIncome;
            console.log(JSON.stringify(updatedIncome));

            let totalIncome = 0;
            for (const key in state.income) {
              const income = state.income[key];
              totalIncome += income.total;
            }
            state.cashFlowSummary.inflow = totalIncome;
            break;
          case TransactionCategory.Expense:
            console.log('Updating expense');

            const currentExpense = state.expense[accountingMonth];
            const updatedExpense: CashFlow = {
              type: 'expense',
              period: accountingMonth,
              total: currentExpense ? currentExpense.total + amount : amount,
            };
            state.expense[accountingMonth] = updatedExpense;
            console.log(JSON.stringify(updatedExpense));

            let totalExpense = 0;
            for (const expenseMonth in state.expense) {
              const expense = state.expense[expenseMonth];
              totalExpense += expense.total;
            }
            console.log(`Total Expense: ${totalExpense}`);
            state.cashFlowSummary.outflow = totalExpense;
            break;
        }
        state.cashFlowSummary.difference =
          state.cashFlowSummary.inflow - state.cashFlowSummary.outflow;
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
            const transactionMonth = toAccountingMonth(
              new Date(transaction.date)
            );

            switch (transaction.category) {
              case TransactionCategory.Income:
                if (!state.income[transactionMonth]) {
                  state.income[transactionMonth] = {
                    type: 'income',
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
                    type: 'expense',
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

        state.cashFlowSummary.inflow = totalIncome;
        state.cashFlowSummary.outflow = totalExpense;
        state.cashFlowSummary.difference = totalIncome - totalExpense;
      })
      .addCase(getTransactions.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.error;
      });
  },
});

export const { setAccountingPeriod, addTransaction } = cashFlowSlice.actions;
export const selectHasError = (state: any) => !!state.cashflow.error;
export const selectError = (state: any) => state.cashflow.error;
export const selectBudgetPeriod = createSelector(
  (state: any) => state.cashflow.cashFlowSummary,
  (cashFlowSummary) => ({
    startPeriod: cashFlowSummary.startPeriod,
    endPeriod: cashFlowSummary.endPeriod,
  })
);
export const selectBudgetInflow = (state: any) => state.cashflow.inflow;
export const selectBudgetOutflow = (state: any) => state.cashflow.outflow;
export const selectBudgetSummary = createSelector(
  (state: any) => state.cashflow.cashFlowSummary,
  (cashFlowSummary) => ({
    startPeriod: cashFlowSummary.startPeriod,
    endPeriod: cashFlowSummary.endPeriod,
    inflow: cashFlowSummary.inflow,
    outflow: cashFlowSummary.outflow,
    difference: cashFlowSummary.difference,
  })
);

export default cashFlowSlice.reducer;
