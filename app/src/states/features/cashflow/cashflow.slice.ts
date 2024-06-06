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
  CashFlowStatement,
  CashFlowStatements,
  CashFlowStatementType,
  CashFlowSummary,
  SerializableCashFlowSummary,
} from '@/types/CashFlow';
import { isTransactionDateWithin, toFormattedDate } from '@/utils/date.utils';
import { AccountingPeriodSlot } from '@/types/AccountingPeriod';
import {
  computeAccountingPeriodSlots,
  getAccountingPeriodFromSlotKey,
  getAccountingPeriodSlot,
} from '@/lib/helpers/accounting.helper';
import { v4 as uuidv4 } from 'uuid';
import { end } from '@popperjs/core';

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
  cashFlows: CashFlowStatements;
  status: Status;
  error?: any;
};

type GetTransactionResponse = {
  transactions: TransactionResponse[];
  appendToExistingTransactions: boolean;
  parentStatementSlotId?: string;
  startPeriod: string;
  endPeriod: string;
};

type GetTransactionRequest = {
  startPeriod: string;
  endPeriod: string;
  append: boolean;
  parentStatementSlotId?: string;
};

const initialState: CashFlowState = {
  overallCashFlowForPeriod: {
    id: `${uuidv4()}`,
    parentRef: undefined,
    statementType: 'Summary',
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

const initialiseCashFlowStatementSlots = (
  state: any,
  accountingPeriodSlots: AccountingPeriodSlot[],
  statementType: CashFlowStatementType = 'Summary',
  parentSlotRef: string | undefined = undefined
): void => {
  accountingPeriodSlots.forEach((slot) => {
    if (!state.cashFlows[slot.key]) {
      state.cashFlows[slot.key] = {
        id: `${uuidv4()}`,
        parentRef: parentSlotRef,
        statementType,
        accountingPeriod: {
          startPeriod: slot.startPeriod.toISOString(),
          endPeriod: slot.endPeriod.toISOString(),
        },
        income: {
          type: 'income',
          total: 0,
        },
        expense: {
          type: 'expense',
          total: 0,
        },
      } satisfies CashFlowStatement;
    }
  });
};

const getAccountingPeriodSlots = (
  startPeriod: string,
  endPeriod: string
): AccountingPeriodSlot[] => {
  const accountingStartPeriod = new Date(startPeriod);
  const accountingEndPeriod = new Date(endPeriod);

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
  async (getTransactionRequest: GetTransactionRequest) => {
    const {
      startPeriod: requestStartPeriod,
      endPeriod: requestEndPeriod,
      append,
    } = getTransactionRequest;

    const formattedStartPeriod = toFormattedDate(
      new Date(requestStartPeriod),
      'yyyy-MM-dd'
    );
    const formattedEndPeriod = toFormattedDate(
      new Date(requestEndPeriod),
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
      throw new Error(
        `Error get transactions for the period: ${requestStartPeriod} - ${requestEndPeriod}`
      );
    }
    return {
      appendToExistingTransactions: append,
      parentStatementSlotId: getTransactionRequest.parentStatementSlotId,
      transactions: (await response.json()) as TransactionResponse[],
      startPeriod: new Date(requestStartPeriod).toISOString(),
      endPeriod: new Date(requestEndPeriod).toISOString(),
    } as GetTransactionResponse;
  }
);

const getTransactionsReducer = (
  state: any,
  action: PayloadAction<GetTransactionResponse>
) => {
  const {
    transactions: transactionDtos,
    appendToExistingTransactions,
    parentStatementSlotId,
    startPeriod,
    endPeriod,
  } = action.payload;

  let parentRef = undefined;
  let accountingPeriodSlots: AccountingPeriodSlot[] = [];
  if (appendToExistingTransactions) {
    parentRef = parentStatementSlotId;
    accountingPeriodSlots = getAccountingPeriodSlots(startPeriod, endPeriod);
  } else {
    state.cashFlows = {};
    parentRef = state.overallCashFlowForPeriod.id;
    accountingPeriodSlots = getAccountingPeriodSlots(
      state.overallCashFlowForPeriod.startPeriod,
      state.overallCashFlowForPeriod.endPeriod
    );
  }

  initialiseCashFlowStatementSlots(
    state,
    accountingPeriodSlots,
    'Summary',
    parentRef
  );

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
      const cashFlowForPeriod = state.cashFlows[slot.key];

      switch (transaction.mode) {
        case TransactionMode.Income:
          const updatedIncome = {
            ...cashFlowForPeriod.income,
            total: cashFlowForPeriod.income.total + transaction.amount,
          };
          state.cashFlows[slot.key].income = updatedIncome;

          if (!appendToExistingTransactions) {
            totalIncome += transaction.amount;
          }
          break;
        case TransactionMode.Expense:
          const updatedExpense = {
            ...cashFlowForPeriod.expense,
            total: cashFlowForPeriod.expense.total + transaction.amount,
          };
          state.cashFlows[slot.key].expense = updatedExpense;

          if (!appendToExistingTransactions) {
            totalExpense += transaction.amount;
          }
          break;
      }
    });
  } catch (error) {
    state.error = error;
  }

  if (!appendToExistingTransactions) {
    state.overallCashFlowForPeriod.inflow = totalIncome;
    state.overallCashFlowForPeriod.outflow = totalExpense;
    state.overallCashFlowForPeriod.difference = totalIncome - totalExpense;
  }
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
  const budgetStartPeriod: string = state.overallCashFlowForPeriod.startPeriod;
  const budgetEndPeriod: string = state.overallCashFlowForPeriod.endPeriod;

  if (!budgetStartPeriod || !budgetEndPeriod) {
    console.log('Undefined budget start and end period.');
    return;
  }

  const accountingPeriodSlots = getAccountingPeriodSlots(
    budgetStartPeriod,
    budgetEndPeriod
  );
  initialiseCashFlowStatementSlots(state, accountingPeriodSlots);

  transactions.forEach((transaction: TransactionResponse) => {
    const { mode, amount, date } = transaction;
    console.log(`Transaction Detail: ${date}, ${mode}, ${amount}`);

    const transactionDate = new Date(date);
    if (
      !isTransactionDateWithin(
        transactionDate,
        new Date(budgetStartPeriod),
        new Date(budgetEndPeriod)
      )
    ) {
      return;
    }
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
      id: cashFlowSummary.id,
      parentRef: cashFlowSummary.parentRef,
      statementType: cashFlowSummary.statementType,
      startPeriod: new Date(cashFlowSummary.startPeriod),
      endPeriod: new Date(cashFlowSummary.endPeriod),
      inflow: cashFlowSummary.inflow,
      outflow: cashFlowSummary.outflow,
      difference: cashFlowSummary.difference,
    }) as CashFlowSummary
);

export const selectInitialCashFlowStatements = createSelector(
  [
    (state: any) => state.cashflow,
    (state: any) => state.overallCashFlowForPeriod,
  ],
  (cashflow, overallCashFlowForPeriod): CashFlowSummary[] => {
    let cashFlows = cashflow.cashFlows;

    const summaryNodes: CashFlowSummary[] = [];
    for (const cashFlowSlot in cashFlows) {
      const cashFlowBySlot: CashFlowStatement = cashFlows[cashFlowSlot];
      if (
        cashFlowBySlot.parentRef &&
        overallCashFlowForPeriod &&
        cashFlowBySlot.parentRef != overallCashFlowForPeriod.id
      ) {
        continue;
      }
      const accountingPeriod = getAccountingPeriodFromSlotKey(cashFlowSlot);
      if (!accountingPeriod) {
        continue;
      }

      const cashFlow: CashFlowSummary = {
        id: cashFlowBySlot.id,
        parentRef: cashFlowBySlot.parentRef,
        statementType: cashFlowBySlot.statementType,
        startPeriod: accountingPeriod.startPeriod,
        endPeriod: accountingPeriod.endPeriod,
        inflow: cashFlowBySlot.income.total,
        outflow: cashFlowBySlot.expense.total,
        difference: cashFlowBySlot.income.total - cashFlowBySlot.expense.total,
        currency: 'SGD',
      };

      summaryNodes.push(cashFlow);
    }

    return summaryNodes;
  }
);

export const selectSubsequentCashFlowStatements = createSelector(
  [(state: any) => state.cashflow, (parentStatementId) => parentStatementId],
  (cashflow, parentStatementId): CashFlowSummary[] => {
    let cashFlows = cashflow.cashFlows;

    const summaryNodes: CashFlowSummary[] = [];
    for (const cashFlowSlot in cashFlows) {
      const cashFlowBySlot: CashFlowStatement = cashFlows[cashFlowSlot];
      if (
        cashFlowBySlot.parentRef &&
        cashFlowBySlot.parentRef != parentStatementId
      ) {
        continue;
      }
      const accountingPeriod = getAccountingPeriodFromSlotKey(cashFlowSlot);
      if (!accountingPeriod) {
        continue;
      }

      const cashFlow: CashFlowSummary = {
        id: cashFlowBySlot.id,
        parentRef: cashFlowBySlot.parentRef,
        statementType: cashFlowBySlot.statementType,
        startPeriod: accountingPeriod.startPeriod,
        endPeriod: accountingPeriod.endPeriod,
        inflow: cashFlowBySlot.income.total,
        outflow: cashFlowBySlot.expense.total,
        difference: cashFlowBySlot.income.total - cashFlowBySlot.expense.total,
        currency: 'SGD',
      };

      summaryNodes.push(cashFlow);
    }

    return summaryNodes;
  }
);

export default cashflowSlice.reducer;
