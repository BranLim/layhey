import {
  createAsyncThunk,
  createSelector,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit';
import {
  AddTransactionRequest,
  TransactionMode,
  TransactionRequest,
  TransactionResponse,
} from '@/types/Transaction';
import {
  CashFlow,
  CashFlowSummary,
  SerializableCashFlowSummary,
} from '@/types/CashFlow';
import {
  fromAccountingMonthToDate,
  isTransactionDateWithin,
  toAccountingMonth,
  toFormattedDate,
} from '@/utils/date.utils';
import {
  AccountingPeriodSlot,
  SerializableAccountingPeriod,
} from '@/types/AccountingPeriod';
import { getErrorMessage } from '@/utils/error.utils';
import {
  computeAccountingPeriodSlots,
  getAccountingPeriodFromSlotKey,
  getAccountingPeriodSlot,
} from '@/lib/helpers/accounting.helper';

type Status =
  | 'idle'
  | 'loading'
  | 'load_complete'
  | 'recompute'
  | 'computing'
  | 'compute_completed'
  | 'error';

type CashFlowState = {
  overallCashFlowForPeriod: SerializableCashFlowSummary;
  cashFlows: {
    [key: string]: {
      accountingPeriod: SerializableAccountingPeriod;
      income: CashFlow;
      expense: CashFlow;
    };
  };

  status: Status;
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
  cashFlows: {},
  status: 'idle',
};

const initialiseCashFlowByPeriod = (
  state: any,
  accountingPeriodSlots: AccountingPeriodSlot[]
) => {
  accountingPeriodSlots.forEach((slot) => {
    if (!state.cashFlows[slot.key]) {
      state.cashFlows[slot.key] = {
        accountingPeriod: {
          startPeriod: slot.startPeriod.toISOString(),
          endPeriod: slot.endPeriod.toISOString(),
        },
        income: {
          type: 'income',
          period: slot.key,
          total: 0,
        },
        expense: {
          type: 'expense',
          period: slot.key,
          total: 0,
        },
      };
    }
  });
};

const getAccountingPeriodSlots = (state: any): AccountingPeriodSlot[] => {
  const accountingStartPeriod = new Date(
    state.overallCashFlowForPeriod.startPeriod
  );
  const accountingEndPeriod = new Date(
    state.overallCashFlowForPeriod.endPeriod
  );

  return computeAccountingPeriodSlots(
    accountingStartPeriod,
    accountingEndPeriod
  );
};

export const addTransaction = createAsyncThunk(
  'cashflow/addTransactions',
  async (
    newTransaction: AddTransactionRequest
  ): Promise<TransactionResponse[]> => {
    const apiPath = `${process.env.NEXT_PUBLIC_SERVER_URL}/api/transactions`;
    const response = await fetch(apiPath, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(newTransaction),
    });

    if (!response.ok) {
      throw new Error('Error adding new transaction');
    }
    const transactions = (await response.json()) as TransactionResponse[];
    return transactions;
  }
);

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

      const apiPath = `${process.env.NEXT_PUBLIC_SERVER_URL}/api/transactions?startPeriod=${formattedStartPeriod}&endPeriod=${formattedEndPeriod}`;
      const response = await fetch(apiPath, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
      });
      if (!response.ok) {
        rejectWithValue(
          `Error get transactions for the period: ${startPeriod} - ${endPeriod}`
        );
      }
      return (await response.json()) as TransactionResponse[];
    } catch (error: any) {
      console.error(error);
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const getTransactionsReducer = (
  state: any,
  action: PayloadAction<TransactionResponse[]>
) => {
  state.cashFlows = {};

  const transactionDtos: TransactionResponse[] = action.payload;

  const accountingPeriodSlots = getAccountingPeriodSlots(state);
  initialiseCashFlowByPeriod(state, accountingPeriodSlots);

  let totalIncome = 0;
  let totalExpense = 0;
  try {
    transactionDtos?.forEach((transaction: TransactionRequest) => {
      const slot = getAccountingPeriodSlot(
        accountingPeriodSlots,
        new Date(transaction.date)
      );
      if (!slot) {
        return;
      }
      const cashFlowForPeriod = state.cashFlows[slot?.key];

      switch (transaction.mode) {
        case TransactionMode.Income:
          const updatedIncome = {
            ...cashFlowForPeriod.income,
            total: cashFlowForPeriod.income.total + transaction.amount,
          };
          state.cashFlows[slot.key].income = updatedIncome;

          totalIncome += transaction.amount;
          break;
        case TransactionMode.Expense:
          const updatedExpense = {
            ...cashFlowForPeriod.expense,
            total: cashFlowForPeriod.expense.total + transaction.amount,
          };
          state.cashFlows[slot.key].expense = updatedExpense;

          totalExpense += transaction.amount;
          break;
      }
    });
  } catch (error) {
    state.error = error;
  }

  state.overallCashFlowForPeriod.inflow = totalIncome;
  state.overallCashFlowForPeriod.outflow = totalExpense;
  state.overallCashFlowForPeriod.difference = totalIncome - totalExpense;
  state.status = 'load_complete';
};

const addTransactionReducer = (
  state: any,
  action: PayloadAction<TransactionResponse[]>
) => {
  const transactions = action.payload;
  if (!transactions) {
    return;
  }
  const accountingPeriodSlots = getAccountingPeriodSlots(state);
  initialiseCashFlowByPeriod(state, accountingPeriodSlots);

  transactions.forEach((transaction: TransactionResponse) => {
    const { mode, amount, date } = transaction;
    console.log(`Transaction Detail: ${date}, ${mode}, ${amount}`);

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
      const accountingPeriodSlot = getAccountingPeriodSlot(
        accountingPeriodSlots,
        new Date(transaction.date)
      );
      if (!accountingPeriodSlot) {
        return;
      }

      const cashFlowForPeriod = state.cashFlows[accountingPeriodSlot.key];
      switch (mode) {
        case TransactionMode.Income:
          console.log('Updating income');

          const updatedIncome = {
            ...cashFlowForPeriod.income,
            total: cashFlowForPeriod.income.total + amount,
          };
          state.cashFlows[accountingPeriodSlot.key].income = updatedIncome;
          console.log(JSON.stringify(updatedIncome));

          let totalIncome = 0;
          for (const key in state.cashFlows) {
            const cashFlowForMonth = state.cashFlows[key];
            totalIncome += cashFlowForMonth.income.total;
          }
          state.overallCashFlowForPeriod.inflow = totalIncome;
          break;
        case TransactionMode.Expense:
          console.log('Updating expense');

          const updatedExpense = {
            ...cashFlowForPeriod.expense,
            total: cashFlowForPeriod.expense.total + amount,
          };
          state.cashFlows[accountingPeriodSlot.key].expense = updatedExpense;
          console.log(JSON.stringify(updatedExpense));

          let totalExpense = 0;
          for (const key in state.cashFlows) {
            const cashFlowForMonth = state.cashFlows[key];
            totalExpense += cashFlowForMonth.expense.total;
          }
          state.overallCashFlowForPeriod.outflow = totalExpense;
          break;
      }
      state.overallCashFlowForPeriod.difference =
        state.overallCashFlowForPeriod.inflow -
        state.overallCashFlowForPeriod.outflow;
      state.status = 'compute_completed';
    }
  });
};

const cashflowSlice = createSlice({
  name: 'cashflow',
  initialState,
  reducers: {
    setCashFlowAccountingPeriod: (
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
  },
  extraReducers: (builder) => {
    builder
      .addCase(getTransactions.pending, (state, action) => {
        state.status = 'loading';
        if (state.error) {
          state.error = undefined;
        }
      })
      .addCase(getTransactions.fulfilled, getTransactionsReducer)
      .addCase(getTransactions.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.error;
      })
      .addCase(addTransaction.pending, (state, action) => {
        state.status = 'computing';
        if (state.error) {
          state.error = undefined;
        }
      })
      .addCase(addTransaction.fulfilled, addTransactionReducer);
  },
});

export const { setCashFlowAccountingPeriod } = cashflowSlice.actions;
export const selectCashFlowStoreStatus = (state: any) => state.cashflow.status;
export const selectAccountingPeriod = createSelector(
  (state: any) => state.cashflow.overallCashFlowForPeriod,
  (cashFlowSummary) => ({
    startPeriod: cashFlowSummary.startPeriod,
    endPeriod: cashFlowSummary.endPeriod,
  })
);
export const selectCashFlowSummary = createSelector(
  (state: any) => state.cashflow.overallCashFlowForPeriod,
  (cashFlowSummary: SerializableCashFlowSummary) =>
    ({
      startPeriod: new Date(cashFlowSummary.startPeriod),
      endPeriod: new Date(cashFlowSummary.endPeriod),
      inflow: cashFlowSummary.inflow,
      outflow: cashFlowSummary.outflow,
      difference: cashFlowSummary.difference,
    }) as CashFlowSummary
);

export const selectAllCashFlowSummaryForAccountingPeriod = createSelector(
  (state: any) => state.cashflow,
  (cashflow): CashFlowSummary[] => {
    const cashFlows = cashflow.cashFlows;

    const summaryNodes: CashFlowSummary[] = [];
    for (const cashFlowSlot in cashFlows) {
      const cashFlowBySlots = cashFlows[cashFlowSlot];
      const accountingPeriod = getAccountingPeriodFromSlotKey(cashFlowSlot);
      if (!accountingPeriod) {
        continue;
      }

      const cashFlow: CashFlowSummary = {
        startPeriod: accountingPeriod.startPeriod,
        endPeriod: accountingPeriod.endPeriod,
        inflow: cashFlowBySlots.income.total,
        outflow: cashFlowBySlots.expense.total,
        difference:
          cashFlowBySlots.income.total - cashFlowBySlots.expense.total,
        currency: 'SGD',
      };

      summaryNodes.push(cashFlow);
    }

    return summaryNodes;
  }
);

export default cashflowSlice.reducer;
