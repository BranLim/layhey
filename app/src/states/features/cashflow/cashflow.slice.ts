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
  getMatchingAccountingPeriodSlots,
} from '@/lib/helpers/accounting.helper';
import { v4 as uuidv4 } from 'uuid';

type Status =
  | 'idle'
  | 'pre_get_transactions'
  | 'get_transactions'
  | 'get_transactions_completed'
  | 'pre_add_transaction'
  | 'post_add_transaction'
  | 'post_add_transaction_completed'
  | 'generate_cashflow_summary_graph'
  | 'post_generate_cashflow_summary_graph'
  | 'error';

type CashFlowState = {
  overallCashFlowForPeriod: SerializableCashFlowSummary;
  cashFlows: CashFlowStatements;
  cashFlowSummaries: {
    [parentStatementId: string]: SerializableCashFlowSummary[];
  };
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

export type GetTransactionRequest = {
  startPeriod: string;
  endPeriod: string;
  append: boolean;
  parentStatementSlotId?: string;
};

const initialCashFlowState: CashFlowState = {
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
  cashFlowSummaries: {},
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
  state.status = 'get_transactions_completed';
};

const addTransactionReducer = (
  state: any,
  action: PayloadAction<TransactionResponse[]>
) => {
  state.status = 'post_add_transaction';

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
    const amatchingAcountingPeriodSlots = getMatchingAccountingPeriodSlots(
      accountingPeriodSlots,
      new Date(transaction.date)
    );

    if (!amatchingAcountingPeriodSlots) {
      return;
    }

    amatchingAcountingPeriodSlots.forEach((accountingPeriodSlot) => {
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

          break;
        case TransactionMode.Expense:
          console.log('Updating expense');

          const updatedExpense = {
            ...cashFlowForPeriod.expense,
            total: cashFlowForPeriod.expense.total + amount,
          };
          state.cashFlows[accountingPeriodSlot.key].expense = updatedExpense;
          console.log(JSON.stringify(updatedExpense));

          break;
      }
    });
  });

  const rootStatementId = state.overallCashFlowForPeriod.id;
  let totalExpense = 0;
  let totalIncome = 0;
  for (const key in state.cashFlows) {
    const cashFlow = state.cashFlows[key];
    if (cashFlow.parentRef === rootStatementId) {
      totalExpense += cashFlow.expense.total;
      totalIncome += cashFlow.income.total;
    }
  }

  state.overallCashFlowForPeriod.inflow = totalIncome;
  state.overallCashFlowForPeriod.outflow = totalExpense;
  state.overallCashFlowForPeriod.difference =
    state.overallCashFlowForPeriod.inflow -
    state.overallCashFlowForPeriod.outflow;
  state.status = 'post_add_transaction_completed';
};

const cashflowSlice = createSlice({
  name: 'cashflow',
  initialState: initialCashFlowState,
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
    generateCashFlowSummaryGraph: (state, action: PayloadAction<string>) => {
      state.status = 'generate_cashflow_summary_graph';

      const parentStatementId: string = action.payload;
      const cashFlows = state.cashFlows;

      const summaryNodes: SerializableCashFlowSummary[] = [];
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

        const cashFlow: SerializableCashFlowSummary = {
          id: cashFlowBySlot.id,
          parentRef: cashFlowBySlot.parentRef,
          statementType: cashFlowBySlot.statementType,
          startPeriod: accountingPeriod.startPeriod.toISOString(),
          endPeriod: accountingPeriod.endPeriod.toISOString(),
          inflow: cashFlowBySlot.income.total,
          outflow: cashFlowBySlot.expense.total,
          difference:
            cashFlowBySlot.income.total - cashFlowBySlot.expense.total,
          currency: 'SGD',
        };

        summaryNodes.push(cashFlow);
      }
      state.cashFlowSummaries[parentStatementId] = summaryNodes;
      state.status = 'post_generate_cashflow_summary_graph';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getTransactions.pending, (state, action) => {
        state.status = 'pre_get_transactions';
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
        state.status = 'pre_add_transaction';
        if (state.error) {
          state.error = undefined;
        }
      })
      .addCase(addTransaction.fulfilled, addTransactionReducer)
      .addCase(addTransaction.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.error;
      });
  },
});

export const { setCashFlowAccountingPeriod, generateCashFlowSummaryGraph } =
  cashflowSlice.actions;
export const selectCashFlowStoreStatus = (state: any) => state.cashflow.status;
export const selectAccountingPeriod = createSelector(
  (state: any) => state.cashflow.overallCashFlowForPeriod,
  (cashFlowSummary) => ({
    startPeriod: cashFlowSummary.startPeriod,
    endPeriod: cashFlowSummary.endPeriod,
  })
);
export const selectOverallCashFlowSummary = createSelector(
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
export const selectCashFlowStatements = createSelector(
  [
    (state: any) => state.cashflow.cashFlowSummaries,
    (state: any, parentStatementId: string) => parentStatementId,
  ],
  (cashFlowSummaries, parentStatementId): SerializableCashFlowSummary[] =>
    cashFlowSummaries[parentStatementId]
);

export default cashflowSlice.reducer;
