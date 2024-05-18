import {
  createAsyncThunk,
  createSelector,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit';
import {
  TransactionCategory,
  TransactionRequest,
  TransactionResponse,
} from '@/types/Transaction';
import {
  CashFlow,
  CashFlowSummary,
  CashFlowSummaryState,
} from '@/types/CashFlow';
import {
  fromAccountingMonthToDate,
  isTransactionDateWithin,
  toAccountingMonth,
  toFormattedDate,
} from '@/utils/date-utils';

type CashFlowState = {
  overallCashFlowForPeriod: CashFlowSummaryState;
  cashFlowByMonth: {
    [key: string]: {
      income: CashFlow;
      expense: CashFlow;
    };
  };

  status: string;
  error?: any;
};

const initialState: CashFlowState = {
  overallCashFlowForPeriod: {
    startPeriod: '',
    endPeriod: '',
    inflow: 0,
    outflow: 0,
    difference: 0,
    currency: 'SGD',
  },
  cashFlowByMonth: {},
  status: 'idle',
};

const initialiseCashFlowByMonth = (state: any, accountingMonth: string) => {
  if (!state.cashFlowByMonth[accountingMonth]) {
    state.cashFlowByMonth[accountingMonth] = {
      income: {
        type: 'income',
        period: accountingMonth,
        total: 0,
      },
      expense: {
        type: 'expense',
        period: accountingMonth,
        total: 0,
      },
    };
  }
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
    setAccountingPeriod: (
      state,
      action: PayloadAction<{ startPeriod: string; endPeriod: string }>
    ) => {
      const { startPeriod, endPeriod } = action.payload;
      state.overallCashFlowForPeriod.startPeriod = new Date(
        startPeriod
      ).toISOString();
      state.overallCashFlowForPeriod.endPeriod = new Date(
        endPeriod
      ).toISOString();
    },
    addTransaction: (state, action: PayloadAction<TransactionRequest>) => {
      const { date, category, amount } = action.payload;
      console.log(`Transaction Detail: ${date}, ${category}, ${amount}`);
      const budgetStartPeriod: string =
        state.overallCashFlowForPeriod.startPeriod;
      const budgetEndPeriod: string = state.overallCashFlowForPeriod.endPeriod;

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
        initialiseCashFlowByMonth(state, accountingMonth);

        const cashFlowForPeriod = state.cashFlowByMonth[accountingMonth];
        switch (category) {
          case TransactionCategory.Income:
            console.log('Updating income');

            const updatedIncome = {
              ...cashFlowForPeriod.income,
              total: cashFlowForPeriod.income.total + amount,
            };
            state.cashFlowByMonth[accountingMonth].income = updatedIncome;
            console.log(JSON.stringify(updatedIncome));

            let totalIncome = 0;
            for (const key in state.cashFlowByMonth) {
              const cashFlowForMonth = state.cashFlowByMonth[key];
              totalIncome += cashFlowForMonth.income.total;
            }
            state.overallCashFlowForPeriod.inflow = totalIncome;
            break;
          case TransactionCategory.Expense:
            console.log('Updating expense');

            const updatedExpense = {
              ...cashFlowForPeriod.expense,
              total: cashFlowForPeriod.expense.total + amount,
            };
            state.cashFlowByMonth[accountingMonth].expense = updatedExpense;
            console.log(JSON.stringify(updatedExpense));

            let totalExpense = 0;
            for (const key in state.cashFlowByMonth) {
              const cashFlowForMonth = state.cashFlowByMonth[key];
              totalExpense += cashFlowForMonth.expense.total;
            }
            state.overallCashFlowForPeriod.outflow = totalExpense;
            break;
        }
        state.overallCashFlowForPeriod.difference =
          state.overallCashFlowForPeriod.inflow -
          state.overallCashFlowForPeriod.outflow;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getTransactions.pending, (state, action) => {
        state.status = 'loading';
        state.cashFlowByMonth = {};
        if (state.error) {
          state.error = undefined;
        }
      })
      .addCase(
        getTransactions.fulfilled,
        (state, action: PayloadAction<TransactionResponse[]>) => {
          const transactionDtos: TransactionResponse[] = action.payload;

          let totalIncome = 0;
          let totalExpense = 0;
          try {
            transactionDtos?.forEach((transaction) => {
              const accountingMonth = toAccountingMonth(
                new Date(transaction.date)
              );

              initialiseCashFlowByMonth(state, accountingMonth);

              const cashFlowForPeriod = state.cashFlowByMonth[accountingMonth];

              switch (transaction.category) {
                case TransactionCategory.Income:
                  const updatedIncome = {
                    ...cashFlowForPeriod.income,
                    total: cashFlowForPeriod.income.total + transaction.amount,
                  };
                  state.cashFlowByMonth[accountingMonth].income = updatedIncome;

                  totalIncome += transaction.amount;
                  break;
                case TransactionCategory.Expense:
                  const updatedExpense = {
                    ...cashFlowForPeriod.expense,
                    total: cashFlowForPeriod.expense.total + transaction.amount,
                  };
                  state.cashFlowByMonth[accountingMonth].expense =
                    updatedExpense;

                  totalExpense += transaction.amount;
                  break;
              }
            });
          } catch (error) {
            state.error = error;
          }

          state.overallCashFlowForPeriod.inflow = totalIncome;
          state.overallCashFlowForPeriod.outflow = totalExpense;
          state.overallCashFlowForPeriod.difference =
            totalIncome - totalExpense;
        }
      )
      .addCase(getTransactions.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.error;
      });
  },
});

export const { setAccountingPeriod, addTransaction } = cashFlowSlice.actions;
export const selectHasError = (state: any) => !!state.cashflow.error;
export const selectError = (state: any) => state.cashflow.error;
export const selectAccountingPeriod = createSelector(
  (state: any) => state.cashflow.overallCashFlowForPeriod,
  (cashFlowSummary) => ({
    startPeriod: cashFlowSummary.startPeriod,
    endPeriod: cashFlowSummary.endPeriod,
  })
);
export const selectCashFlowSummary = createSelector(
  (state: any) => state.cashflow.overallCashFlowForPeriod,
  (cashFlowSummary: CashFlowSummaryState) =>
    ({
      startPeriod: new Date(cashFlowSummary.startPeriod),
      endPeriod: new Date(cashFlowSummary.endPeriod),
      inflow: cashFlowSummary.inflow,
      outflow: cashFlowSummary.outflow,
      difference: cashFlowSummary.difference,
    }) as CashFlowSummary
);

export const selectAllCashFlowSummaryByMonthWithinAccountingPeriod =
  createSelector(
    (state: any) => state.cashflow,
    (cashflow): CashFlowSummary[] => {
      const cashFlows = cashflow.cashFlowByMonth;

      const summaryNodes: CashFlowSummary[] = [];
      for (const accountingMonth in cashFlows) {
        const cashflowByMonth = cashFlows[accountingMonth];
        const accountingPeriod = fromAccountingMonthToDate(accountingMonth);

        const cashFlow: CashFlowSummary = {
          startPeriod: new Date(
            accountingPeriod.getFullYear(),
            accountingPeriod.getMonth(),
            1
          ),
          endPeriod: new Date(
            accountingPeriod.getFullYear(),
            accountingPeriod.getMonth() + 1,
            0
          ),
          inflow: cashflowByMonth.income.total,
          outflow: cashflowByMonth.expense.total,
          difference:
            cashflowByMonth.income.total - cashflowByMonth.expense.total,
          currency: 'SGD',
        };

        summaryNodes.push(cashFlow);
      }

      return summaryNodes;
    }
  );

export default cashFlowSlice.reducer;
