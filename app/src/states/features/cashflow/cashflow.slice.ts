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
import CashFlow from '@/types/CashFlow';
import { isTransactionDateWithin } from '@/utils/date.utils';
import { StatementPeriodSlot } from '@/types/AccountingPeriod';
import {
  computeCashFlowStatementPeriods,
  getAccountingPeriodFromSlotKey,
  getAccountingPeriodSlot,
  getMatchingCashFlowStatementPeriodSlots,
} from '@/lib/helpers/cashflow.helper';
import { v4 as uuidv4 } from 'uuid';
import {
  FlowViewState,
  setOverallCashFlowNode,
  showCashFlows,
} from '@/states/features/cashflow/flow.slice';
import { getTransactions } from '@/states/features/cashflow/api/transactions.api';
import { toSerializableStatementPeriods } from '@/lib/mappers/accountingPeriod.mapper';
import { startAppListening } from '@/states/listeners';
import { handleInitialCashFlowLoad } from '@/states/features/cashflow/cashflow.listener';
import SetCashFlowRequest = CashFlow.SetCashFlowRequest;
import { getErrorMessage } from '@/utils/error.utils';

startAppListening({
  predicate: (action, currentState, previousState) => {
    return (
      !currentState.cashflow.initialLoad &&
      currentState.cashflow.status === 'completed_get_overall_cashflow'
    );
  },
  effect: handleInitialCashFlowLoad,
});

type Status =
  | 'idle'
  | 'error'
  | 'pending_get_overall_cashflow'
  | 'completed_get_overall_cashflow'
  | 'updated_overall_cashflows'
  | 'updated_cashflows'
  | 'pending_get_cashflows'
  | 'completed_get_cashflows'
  | 'pending_add_transactions'
  | 'completed_add_transactions';

type CashFlowState = {
  overallCashFlowForPeriod: CashFlow.SerializableCashFlowSummary;
  cashFlows: CashFlow.CashFlowStatements;
  cashFlowSummaries: {
    [parentStatementId: string]: CashFlow.SerializableCashFlowSummary[];
  };
  previousStatus?: Status;
  status: Status;
  initialLoad: boolean;
  error?: any;
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
  accountingPeriodSlots: StatementPeriodSlot[],
  statementType: CashFlow.CashFlowStatementType = 'Summary',
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
      } satisfies CashFlow.CashFlowStatement;
    }
  });
};

const getAccountingPeriodSlots = (
  startPeriod: string,
  endPeriod: string
): StatementPeriodSlot[] => {
  const accountingStartPeriod = new Date(startPeriod);
  const accountingEndPeriod = new Date(endPeriod);

  return computeCashFlowStatementPeriods(
    accountingStartPeriod,
    accountingEndPeriod
  );
};

export const addTransaction = createAsyncThunk<
  void,
  AddTransactionRequest,
  {
    state: {
      cashflow: CashFlowState;
      flow: FlowViewState;
    };
  }
>(
  'cashflow/addTransactions',
  async (
    newTransaction: AddTransactionRequest,
    { dispatch, getState }
  ): Promise<void> => {
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

    let state = getState();
    const budgetStartPeriod: string =
      state.cashflow.overallCashFlowForPeriod.startPeriod;
    const budgetEndPeriod: string =
      state.cashflow.overallCashFlowForPeriod.endPeriod;

    const accountingPeriodSlots = getAccountingPeriodSlots(
      budgetStartPeriod,
      budgetEndPeriod
    );

    dispatch(
      setCashFlowStatementSlots({
        statementPeriodSlots: toSerializableStatementPeriods(
          accountingPeriodSlots
        ),
        parentSlotRef: state.cashflow.overallCashFlowForPeriod.id,
        statementType: 'Summary',
        append: true,
      })
    );

    const transactions = (await response.json()) as TransactionResponse[];

    try {
      transactions?.forEach((transaction: TransactionResponse) => {
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

        matchingCashFlowStatementPeriodSlots.forEach((slot) => {
          const state = getState();
          const cashFlowForPeriod = state.cashflow.cashFlows[slot.key];
          switch (mode) {
            case TransactionMode.Income:
              console.log('Updating income');

              dispatch(
                setCashFlow({
                  key: slot.key,
                  type: TransactionMode.Income,
                  total: cashFlowForPeriod.income.total + transaction.amount,
                } as SetCashFlowRequest)
              );
              break;
            case TransactionMode.Expense:
              console.log('Updating expense');
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
      });
    } catch (error) {
      console.log(getErrorMessage(error));
    }

    state = getState();

    const nodes = [...state.flow.nodes];
    for (const node of nodes) {
      if (node.data.rootNode || node.data.isExpanded) {
        const nodeData = node.data;
        dispatch(
          buildCashFlowSummaryGraph({
            parentStatementId: nodeData.id,
            updateMode: 'InPlace',
          })
        );

        state = getState();

        dispatch(
          showCashFlows({
            targetNodeId: node.id,
            cashFlowSummaries: [
              ...state.cashflow.cashFlowSummaries[nodeData.id],
            ],
            updateMode: 'InPlace',
          })
        );
      }
    }

    state = getState();
    const rootStatementId = state.cashflow.overallCashFlowForPeriod.id;
    let totalExpense = 0;
    let totalIncome = 0;
    for (const key in state.cashflow.cashFlows) {
      const cashFlow = state.cashflow.cashFlows[key];
      if (cashFlow.parentRef === rootStatementId) {
        totalExpense += cashFlow.expense.total;
        totalIncome += cashFlow.income.total;
      }
    }

    dispatch(
      setOverallCashFlow({
        totalExpense: totalExpense,
        totalIncome: totalIncome,
        difference: totalIncome - totalExpense,
      })
    );
  }
);

export const getOverallCashFlowSummary = createAsyncThunk<
  void,
  CashFlow.GetTransactionRequest,
  {
    state: {
      cashflow: CashFlowState;
      flow: FlowViewState;
    };
  }
>(
  'cashflow/getOverallCashFlowSummary',
  async (
    request: CashFlow.GetTransactionRequest,
    { dispatch, getState }
  ): Promise<void> => {
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
      } as CashFlow.CashflowCalculationResult)
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
  CashFlow.GetTransactionRequest,
  { state: { cashflow: CashFlowState; flow: FlowViewState } }
>(
  'cashflow/getCashFlow',
  async (request: CashFlow.GetTransactionRequest, { dispatch, getState }) => {
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
    let statementPeriods: StatementPeriodSlot[] = [];
    if (append) {
      parentRef = parentStatementSlotId;
      statementPeriods = getAccountingPeriodSlots(startPeriod, endPeriod);
    } else {
      statementPeriods = getAccountingPeriodSlots(
        currentState.cashflow.overallCashFlowForPeriod.startPeriod,
        currentState.cashflow.overallCashFlowForPeriod.endPeriod
      );
    }

    dispatch(
      setCashFlowStatementSlots({
        statementPeriodSlots: toSerializableStatementPeriods(statementPeriods),
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
        statementPeriods,
        new Date(transaction.date)
      );

      if (!slot) {
        return;
      }

      currentState = getState();
      const cashFlowForPeriod = currentState.cashflow.cashFlows[slot.key];
      switch (transaction.mode) {
        case TransactionMode.Income:
          dispatch(
            setCashFlow({
              key: slot.key,
              type: TransactionMode.Income,
              total: cashFlowForPeriod.income.total + transaction.amount,
            } as SetCashFlowRequest)
          );

          break;
        case TransactionMode.Expense:
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

    dispatch(
      buildCashFlowSummaryGraph({
        parentStatementId: parentRef,
        updateMode: 'Append',
      })
    );

    currentState = getState();
    dispatch(
      showCashFlows({
        targetNodeId: parentNodeId,
        cashFlowSummaries: [
          ...currentState.cashflow.cashFlowSummaries[parentStatementSlotId],
        ],
        updateMode: 'Append',
      })
    );
  }
);

export const getCashFlowBreakdown = createAsyncThunk<
  void,
  CashFlow.GetTransactionRequest,
  { state: { cashflow: CashFlowState; flow: FlowViewState } }
>(
  'cashflow/getCashFlowBreakdown',
  async (request: CashFlow.GetTransactionRequest, { dispatch, getState }) => {
    const { startPeriod, endPeriod, parentStatementSlotId, parentNodeId } =
      request;
    const currentState = getState();

    const transactions: TransactionResponse[] = await getTransactions(
      startPeriod,
      endPeriod
    );

    transactions?.forEach((transaction: TransactionRequest) => {});
  }
);

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
      action: PayloadAction<CashFlow.CashflowCalculationResult>
    ) => {
      const { totalIncome, totalExpense, difference } = action.payload;

      state.overallCashFlowForPeriod.inflow = totalIncome;
      state.overallCashFlowForPeriod.outflow = totalExpense;
      state.overallCashFlowForPeriod.difference = difference;

      state.previousStatus = state.status;
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
      state.previousStatus = state.status;
      state.status = 'updated_cashflows';
    },
    setCashFlowStatementSlots: (
      state,
      action: PayloadAction<CashFlow.CashFlowInitialisationRequest>
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
    buildCashFlowSummaryGraph: (
      state,
      action: PayloadAction<CashFlow.BuildCashFlowGraphRequest>
    ) => {
      const { parentStatementId, updateMode } = action.payload;
      const cashFlows = state.cashFlows;
      try {
        const summaryNodes: CashFlow.SerializableCashFlowSummary[] =
          updateMode === 'Reset' || !state.cashFlowSummaries[parentStatementId]
            ? []
            : [...state.cashFlowSummaries[parentStatementId]];

        for (const cashFlowSlot in cashFlows) {
          const cashFlowBySlot: CashFlow.CashFlowStatement =
            cashFlows[cashFlowSlot];
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

          const cashFlow: CashFlow.SerializableCashFlowSummary = {
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

          if (updateMode === 'Reset' || updateMode === 'Append') {
            summaryNodes.push(cashFlow);
          } else {
            const currentSummaryIndex = summaryNodes.findIndex(
              (node) => node.id === cashFlowBySlot.id
            );
            summaryNodes[currentSummaryIndex] = cashFlow;
          }
        }
        state.cashFlowSummaries[parentStatementId] = summaryNodes;
      } catch (error) {
        console.log(getErrorMessage(error));
      }
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
      .addCase(addTransaction.fulfilled, (state, action) => {
        state.status = 'completed_add_transactions';
      })
      .addCase(addTransaction.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.error;
      });
  },
});

export const {
  setInitialLoadCompleted,
  setOverallCashFlowStatementPeriod,
  buildCashFlowSummaryGraph,
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
  (cashFlowSummary: CashFlow.SerializableCashFlowSummary) =>
    ({
      id: cashFlowSummary.id,
      parentRef: cashFlowSummary.parentRef,
      statementType: cashFlowSummary.statementType,
      startPeriod: new Date(cashFlowSummary.startPeriod),
      endPeriod: new Date(cashFlowSummary.endPeriod),
      inflow: cashFlowSummary.inflow,
      outflow: cashFlowSummary.outflow,
      difference: cashFlowSummary.difference,
    }) as CashFlow.CashFlowSummary
);
export const selectCashFlowStatements = createSelector(
  [
    (state: any) => state.cashflow.cashFlowSummaries,
    (state: any, parentStatementId: string) => parentStatementId,
  ],
  (
    cashFlowSummaries,
    parentStatementId
  ): CashFlow.SerializableCashFlowSummary[] =>
    cashFlowSummaries[parentStatementId]
);

export const selectIsInitialLoadCompleted = (state: any) =>
  state.cashflow.initialLoad;

export default cashflowSlice.reducer;
