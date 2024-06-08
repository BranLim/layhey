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
import {
  AccountingPeriodSlot,
  SerializableAccountingPeriodSlot,
} from '@/types/AccountingPeriod';
import {
  computeAccountingPeriodSlots,
  getAccountingPeriodFromSlotKey,
  getAccountingPeriodSlot,
  getMatchingCashFlowStatementPeriodSlots,
} from '@/lib/helpers/accounting.helper';
import { v4 as uuidv4 } from 'uuid';
import {
  addCashFlows,
  FlowViewState,
  setOverallCashFlowNode,
} from '@/states/features/cashflow/flow.slice';

type Status =
  | 'idle'
  | 'error'
  | 'pending_get_overall_cashflow'
  | 'completed_get_overall_cashflow'
  | 'updated_overall_cashflows'
  | 'pending_get_cashflows'
  | 'completed_get_cashflows'
  | 'pending_add_transactions';

type CashFlowState = {
  overallCashFlowForPeriod: SerializableCashFlowSummary;
  cashFlows: CashFlowStatements;
  cashFlowSummaries: {
    [parentStatementId: string]: SerializableCashFlowSummary[];
  };
  previousStatus?: Status;
  status: Status;
  initialLoad: boolean;
  error?: any;
};

type CashflowCalculationResult = {
  totalIncome: number;
  totalExpense: number;
  difference: number;
};

type GetTransactionResponse = {
  transactions: TransactionResponse[];
  appendToExistingTransactions: boolean;
  parentStatementSlotId?: string;
  startPeriod: string;
  endPeriod: string;
};

type SetCashFlowRequest = {
  key: string;
  type: TransactionMode;
  total: number;
};

type CashFlowInitialisationRequest = {
  statementPeriodSlots: SerializableAccountingPeriodSlot[];
  statementType: CashFlowStatementType;
  parentSlotRef?: string;
  append: boolean;
};

export type GetTransactionRequest = {
  startPeriod: string;
  endPeriod: string;
  append: boolean;
  parentNodeId: string;
  parentStatementSlotId: string;
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
  previousStatus: undefined,
  status: 'idle',
  initialLoad: false,
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

const getTransactions = async (
  startPeriod: string,
  endPeriod: string
): Promise<TransactionResponse[]> => {
  const formattedStartPeriod = toFormattedDate(
    new Date(startPeriod),
    'yyyy-MM-dd'
  );
  const formattedEndPeriod = toFormattedDate(new Date(endPeriod), 'yyyy-MM-dd');

  const apiPath = `${process.env.NEXT_PUBLIC_SERVER_URL}/api/transactions?startPeriod=${formattedStartPeriod}&endPeriod=${formattedEndPeriod}`;
  const response = await fetch(apiPath, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    },
  });
  if (!response.ok) {
    throw new Error(
      `Error get transactions for the period: ${startPeriod} - ${endPeriod}`
    );
  }

  return (await response.json()) as TransactionResponse[];
};

export const getOverallCashFlowSummary = createAsyncThunk<
  void,
  GetTransactionRequest,
  {
    state: {
      cashflow: CashFlowState;
      flow: FlowViewState;
    };
  }
>(
  'cashflow/getOverallCashFlowSummary',
  async (request: GetTransactionRequest, { dispatch, getState }) => {
    const { startPeriod, endPeriod } = request;

    const transactions: TransactionResponse[] = await getTransactions(
      startPeriod,
      endPeriod
    );

    let totalIncome = 0;
    let totalExpense = 0;
    transactions.forEach((transaction) => {
      switch (transaction.mode) {
        case TransactionMode.Income:
          totalIncome += transaction.amount;
          break;
        case TransactionMode.Expense:
          totalExpense += transaction.amount;
          break;
      }
    });

    dispatch(
      setOverallCashFlow({
        totalExpense: totalExpense,
        totalIncome: totalIncome,
        difference: totalIncome - totalExpense,
      } as CashflowCalculationResult)
    );

    const state = getState();
    if (state.cashflow.status === 'updated_overall_cashflows') {
      dispatch(
        setOverallCashFlowNode({ ...state.cashflow.overallCashFlowForPeriod })
      );
    }
  }
);

export const getCashFlows = createAsyncThunk<
  void,
  GetTransactionRequest,
  { state: { cashflow: CashFlowState; flow: FlowViewState } }
>(
  'cashflow/getCashFlow',
  async (request: GetTransactionRequest, { dispatch, getState }) => {
    const {
      startPeriod,
      endPeriod,
      append,
      parentNodeId,
      parentStatementSlotId,
    } = request;

    console.log('Getting Cashflows');
    let currentState = getState();

    let parentRef = currentState.cashflow.overallCashFlowForPeriod.id;
    let accountingPeriodSlots: AccountingPeriodSlot[] = [];
    if (append) {
      parentRef = parentStatementSlotId;
      accountingPeriodSlots = getAccountingPeriodSlots(startPeriod, endPeriod);
    } else {
      accountingPeriodSlots = getAccountingPeriodSlots(
        currentState.cashflow.overallCashFlowForPeriod.startPeriod,
        currentState.cashflow.overallCashFlowForPeriod.endPeriod
      );
    }

    dispatch(
      setCashFlowStatementSlots({
        statementPeriodSlots: accountingPeriodSlots.map((slot) => {
          return {
            ...slot,
            startPeriod: slot.startPeriod.toISOString(),
            endPeriod: slot.endPeriod.toISOString(),
          } as SerializableAccountingPeriodSlot;
        }),
        parentSlotRef: parentRef,
        statementType: 'Summary',
        append: append,
      })
    );

    const transactions: TransactionResponse[] = await getTransactions(
      startPeriod,
      endPeriod
    );

    transactions?.forEach((transaction: TransactionRequest) => {
      const slot = getAccountingPeriodSlot(
        accountingPeriodSlots,
        new Date(transaction.date)
      );

      if (!slot) {
        return;
      }

      currentState = getState();

      const cashFlowForPeriod = currentState.cashflow.cashFlows[slot.key];
      switch (transaction.mode) {
        case TransactionMode.Income:
          const updatedIncome = {
            ...cashFlowForPeriod.income,
            total: cashFlowForPeriod.income.total + transaction.amount,
          };

          dispatch(
            setCashFlow({
              key: slot.key,
              type: TransactionMode.Income,
              total: cashFlowForPeriod.income.total + transaction.amount,
            } as SetCashFlowRequest)
          );

          break;
        case TransactionMode.Expense:
          const updatedExpense = {
            ...cashFlowForPeriod.expense,
            total: cashFlowForPeriod.expense.total + transaction.amount,
          };
          dispatch(
            setCashFlow({
              key: slot.key,
              type: TransactionMode.Expense,
              total: cashFlowForPeriod.expense.total + transaction.amount,
            } as SetCashFlowRequest)
          );
          break;
      }
    });

    dispatch(generateCashFlowSummaryGraph(parentRef));

    currentState = getState();

    dispatch(
      addCashFlows({
        targetNodeId: parentNodeId,
        cashFlowSummaries: [
          ...currentState.cashflow.cashFlowSummaries[parentStatementSlotId],
        ],
        append: append,
      })
    );
  }
);

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
    const matchingCashFlowStatementPeriodSlots =
      getMatchingCashFlowStatementPeriodSlots(
        accountingPeriodSlots,
        new Date(transaction.date)
      );

    if (!matchingCashFlowStatementPeriodSlots) {
      return;
    }

    matchingCashFlowStatementPeriodSlots.forEach((accountingPeriodSlot) => {
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
    setInitialLoadCompleted: (state) => {
      if (!state.initialLoad) {
        state.initialLoad = true;
      }
    },
    setOverallCashFlowStatementPeriod: (
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
    setOverallCashFlow: (
      state,
      action: PayloadAction<CashflowCalculationResult>
    ) => {
      const { totalIncome, totalExpense, difference } = action.payload;

      state.overallCashFlowForPeriod.inflow = totalIncome;
      state.overallCashFlowForPeriod.outflow = totalExpense;
      state.overallCashFlowForPeriod.difference = difference;

      state.status = 'updated_overall_cashflows';
    },
    setCashFlow: (state, action: PayloadAction<SetCashFlowRequest>) => {
      const { key, total, type } = action.payload;

      switch (type) {
        case TransactionMode.Income:
          state.cashFlows[key].income.total = total;
          break;
        case TransactionMode.Expense:
          state.cashFlows[key].expense.total = total;
          break;
      }
    },
    setCashFlowStatementSlots: (
      state,
      action: PayloadAction<CashFlowInitialisationRequest>
    ) => {
      const { statementType, statementPeriodSlots, parentSlotRef, append } =
        action.payload;

      if (!append) {
        state.cashFlows = {};
      }

      initialiseCashFlowStatementSlots(
        state,
        statementPeriodSlots.map((statementPeriodSlot) => ({
          ...statementPeriodSlot,
          endPeriod: new Date(statementPeriodSlot.endPeriod),
          startPeriod: new Date(statementPeriodSlot.startPeriod),
        })),
        statementType,
        parentSlotRef
      );
    },
    generateCashFlowSummaryGraph: (state, action: PayloadAction<string>) => {
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
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getOverallCashFlowSummary.pending, (state, action) => {
        state.status = 'pending_get_overall_cashflow';
        if (state.error) {
          state.error = undefined;
        }
      })
      .addCase(getOverallCashFlowSummary.fulfilled, (state, action) => {
        state.status = 'completed_get_overall_cashflow';
      })
      .addCase(getOverallCashFlowSummary.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.error;
      })
      .addCase(getCashFlows.pending, (state, action) => {
        state.status = 'pending_get_cashflows';
        if (state.error) {
          state.error = undefined;
        }
      })
      .addCase(getCashFlows.fulfilled, (state, action) => {
        state.status = 'completed_get_cashflows';
      })
      .addCase(getCashFlows.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.error;
      })
      .addCase(addTransaction.pending, (state, action) => {
        state.status = 'pending_add_transactions';
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

export const {
  setInitialLoadCompleted,
  setOverallCashFlowStatementPeriod,
  generateCashFlowSummaryGraph,
  setOverallCashFlow,
  setCashFlow,
  setCashFlowStatementSlots,
} = cashflowSlice.actions;
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

export const selectIsInitialLoadCompleted = (state: any) =>
  state.cashflow.initialLoad;

export default cashflowSlice.reducer;
