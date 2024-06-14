import {
  createAsyncThunk,
  createSelector,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit';
import {
  AddTransactionRequest,
  TransactionMode,
  TransactionResponse,
} from '@/types/Transaction';
import CashFlow from '@/types/CashFlow';
import { isTransactionDateWithin } from '@/utils/date.utils';
import { StatementPeriodSlot } from '@/types/AccountingPeriod';
import {
  computeCashFlowStatementPeriods,
  getAccountingPeriodFromSlotKey,
  getMatchingCashFlowStatementPeriodSlots,
  getStatementPeriodKey,
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
import { getErrorMessage } from '@/utils/error.utils';
import SetCashFlowRequest = CashFlow.SetCashFlowRequest;
import CashFlowStatement = CashFlow.CashFlowStatement;
import ExpenseNodeData = CashFlow.ExpenseNodeData;
import IncomeNodeData = CashFlow.IncomeNodeData;
import IncomeStatement = CashFlow.IncomeStatement;
import ExpenseStatement = CashFlow.ExpenseStatement;

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
    [parentStatementId: string]: (
      | CashFlow.SerializableCashFlowSummary
      | CashFlow.SerializableIncomeSummary
      | CashFlow.SerializableExpenseSummary
    )[];
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

const initialiseCashFlowStatementPeriods = (
  state: any,
  accountingPeriodSlots: StatementPeriodSlot[],
  statementType: CashFlow.CashFlowStatementType = 'Summary',
  parentSlotRef: string | undefined = undefined
): void => {
  accountingPeriodSlots.forEach((slot) => {
    if (!state.cashFlows[slot.key]) {
      if (statementType === 'Summary') {
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
        } as CashFlow.CashFlowStatement;
      } else if (statementType === 'Income') {
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
        } as CashFlow.IncomeStatement;
      } else if (statementType === 'Expense') {
        state.cashFlows[slot.key] = {
          id: `${uuidv4()}`,
          parentRef: parentSlotRef,
          statementType,
          accountingPeriod: {
            startPeriod: slot.startPeriod.toISOString(),
            endPeriod: slot.endPeriod.toISOString(),
          },
          expense: {
            type: 'expense',
            total: 0,
          },
        } as CashFlow.ExpenseStatement;
      }
    }
  });
};

const getCashFlowStatementPeriods = (
  startPeriod: string,
  endPeriod: string
): StatementPeriodSlot[] => {
  const statementStartPeriod = new Date(startPeriod);
  const statementEndPeriod = new Date(endPeriod);

  return computeCashFlowStatementPeriods(
    statementStartPeriod,
    statementEndPeriod
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

    const statementPeriods = getCashFlowStatementPeriods(
      budgetStartPeriod,
      budgetEndPeriod
    );

    dispatch(
      setCashFlowStatementPeriods({
        statementPeriodSlots: toSerializableStatementPeriods(statementPeriods),
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
            statementPeriods,
            new Date(transaction.date)
          );

        if (!matchingCashFlowStatementPeriodSlots) {
          return;
        }

        matchingCashFlowStatementPeriodSlots.forEach((slot) => {
          const state = getState();
          const cashFlowForPeriod = state.cashflow.cashFlows[slot.key];
          if (cashFlowForPeriod.statementType === 'Summary') {
            switch (mode) {
              case TransactionMode.Income:
                console.log('Updating income');

                dispatch(
                  setCashFlow({
                    key: slot.key,
                    transactionMode: TransactionMode.Income,
                    total: cashFlowForPeriod.income.total + transaction.amount,
                  } as SetCashFlowRequest)
                );
                break;
              case TransactionMode.Expense:
                console.log('Updating expense');
                dispatch(
                  setCashFlow({
                    key: slot.key,
                    transactionMode: TransactionMode.Expense,
                    total: cashFlowForPeriod.expense.total + transaction.amount,
                  } as SetCashFlowRequest)
                );
                break;
            }
          }
        });
      });
    } catch (error) {
      console.log(getErrorMessage(error));
    }

    state = getState();

    try {
      const nodes = [...state.flow.nodes];
      for (const node of nodes) {
        if (!node.data || node.data.rootNode) {
          continue;
        }

        const nodeData = node.data;
        switch (nodeData.statementType) {
          case 'Summary':
            dispatch(
              updateCashFlowSummaryGraphNode({
                parentStatementId: nodeData.parentRef ?? '',
                statementId: nodeData.id,
                cashFlowStatementSlotKey: getStatementPeriodKey(
                  new Date(nodeData.startPeriod),
                  new Date(nodeData.endPeriod)
                ),
              })
            );
            break;
          case 'Expense':
            dispatch(
              updateCashFlowSummaryGraphNode({
                parentStatementId: nodeData.parentRef ?? '',
                statementId: nodeData.id,
                cashFlowStatementSlotKey: getStatementPeriodKey(
                  new Date(
                    (nodeData as ExpenseNodeData).accountingPeriod.startPeriod
                  ),
                  new Date(
                    (nodeData as ExpenseNodeData).accountingPeriod.endPeriod
                  )
                ),
              })
            );
            break;
          case 'Income':
            dispatch(
              updateCashFlowSummaryGraphNode({
                parentStatementId: nodeData.parentRef ?? '',
                statementId: nodeData.id,
                cashFlowStatementSlotKey: getStatementPeriodKey(
                  new Date(
                    (nodeData as IncomeNodeData).accountingPeriod.startPeriod
                  ),
                  new Date(
                    (nodeData as IncomeNodeData).accountingPeriod.endPeriod
                  )
                ),
              })
            );
            break;
        }

        state = getState();
        if (node.data.parentRef) {
          dispatch(
            showCashFlows({
              targetNodeId: node.id,
              cashFlowSummaries: [
                ...state.cashflow.cashFlowSummaries[node.data.parentRef],
              ],
              updateMode: 'InPlace',
            })
          );
        }
      }
    } catch (error) {
      console.log(getErrorMessage(error));
    }

    state = getState();
    const rootStatementId = state.cashflow.overallCashFlowForPeriod.id;
    let totalExpense = 0;
    let totalIncome = 0;
    for (const key in state.cashflow.cashFlows) {
      const cashFlow = state.cashflow.cashFlows[key];
      if (
        cashFlow.parentRef === rootStatementId &&
        cashFlow.statementType === 'Summary'
      ) {
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
      statementPeriods = getCashFlowStatementPeriods(startPeriod, endPeriod);
    } else {
      statementPeriods = getCashFlowStatementPeriods(
        currentState.cashflow.overallCashFlowForPeriod.startPeriod,
        currentState.cashflow.overallCashFlowForPeriod.endPeriod
      );
    }

    if (!statementPeriods || statementPeriods.length < 1) {
      return;
    }

    if (
      statementPeriods.every(
        (statement) =>
          !statement.key.includes('_income') &&
          !statement.key.includes('_expense')
      )
    ) {
      dispatch(
        setCashFlowStatementPeriods({
          statementPeriodSlots:
            toSerializableStatementPeriods(statementPeriods),
          parentSlotRef: parentRef,
          statementType: 'Summary',
          append: append,
        })
      );
    } else {
      statementPeriods.forEach((statement) => {
        dispatch(
          setCashFlowStatementPeriods({
            statementPeriodSlots: toSerializableStatementPeriods([statement]),
            parentSlotRef: parentRef,
            statementType: statement.key.includes('_income')
              ? 'Income'
              : 'Expense',
            append: append,
          })
        );
      });
    }

    const transactions: TransactionResponse[] = await getTransactions(
      startPeriod,
      endPeriod
    );

    statementPeriods.forEach((statementPeriod) => {
      const transactionsForPeriod = transactions.filter((transaction) => {
        const transactionDate = new Date(transaction.date);

        return (
          transactionDate > statementPeriod.startPeriod &&
          transactionDate <= statementPeriod.endPeriod
        );
      });

      if (!transactionsForPeriod || transactionsForPeriod.length < 1) {
        return;
      }

      const currentState = getState();
      const incomeCashFlowRequest: SetCashFlowRequest = {
        key: statementPeriod.key,
        transactionMode: TransactionMode.Income,
        total: 0,
        statementType: 'Summary',
      };
      const expenseCashFlowRequest: SetCashFlowRequest = {
        key: statementPeriod.key,
        transactionMode: TransactionMode.Expense,
        total: 0,
        statementType: 'Summary',
      };

      if (statementPeriod.key.includes('_income')) {
        incomeCashFlowRequest.statementType = 'Income';
      } else if (statementPeriod.key.includes('_expense')) {
        expenseCashFlowRequest.statementType = 'Expense';
      }

      transactionsForPeriod.forEach((transaction) => {
        switch (transaction.mode) {
          case 'Income':
            incomeCashFlowRequest.total =
              incomeCashFlowRequest.total + transaction.amount;
            break;
          case 'Expense':
            expenseCashFlowRequest.total =
              expenseCashFlowRequest.total + transaction.amount;
            break;
        }
      });

      try {
        if (
          (!statementPeriod.key.includes('_income') &&
            !statementPeriod.key.includes('_expense')) ||
          statementPeriod.key.includes('_income')
        ) {
          dispatch(setCashFlow(incomeCashFlowRequest));
        }
        if (
          (!statementPeriod.key.includes('_income') &&
            !statementPeriod.key.includes('_expense')) ||
          statementPeriod.key.includes('_expense')
        ) {
          dispatch(setCashFlow(expenseCashFlowRequest));
        }
      } catch (error) {}
    });

    dispatch(buildCashFlowGraph(parentRef));

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
      const { key, total, transactionMode, statementType } = action.payload;

      switch (statementType) {
        case 'Summary':
          switch (transactionMode) {
            case TransactionMode.Income:
              (state.cashFlows[key] as CashFlowStatement).income.total = total;
              break;
            case TransactionMode.Expense:
              (state.cashFlows[key] as CashFlowStatement).expense.total = total;
              break;
          }
          break;
        case 'Income':
          (state.cashFlows[key] as IncomeStatement).income.total = total;
          break;
        case 'Expense':
          (state.cashFlows[key] as ExpenseStatement).expense.total = total;
          break;
      }

      state.previousStatus = state.status;
      state.status = 'updated_cashflows';
    },
    setCashFlowStatementPeriods: (
      state,
      action: PayloadAction<CashFlow.CashFlowInitialisationRequest>
    ) => {
      const { statementType, statementPeriodSlots, parentSlotRef, append } =
        action.payload;

      if (!append) {
        state.cashFlows = {};
      }

      initialiseCashFlowStatementPeriods(
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
    buildCashFlowGraph: (state, action: PayloadAction<string>) => {
      const parentStatementId = action.payload;
      const cashFlows = state.cashFlows;
      try {
        const summaryNodes: (
          | CashFlow.SerializableCashFlowSummary
          | CashFlow.SerializableIncomeSummary
          | CashFlow.SerializableExpenseSummary
        )[] = [];
        for (const cashFlowSlot in cashFlows) {
          const cashFlowBySlot = cashFlows[cashFlowSlot];
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

          switch (cashFlowBySlot.statementType) {
            case 'Summary':
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

              summaryNodes.push(cashFlow);
              break;
            case 'Income':
              const incomeStatement: CashFlow.SerializableIncomeSummary = {
                id: cashFlowBySlot.id,
                parentRef: cashFlowBySlot.parentRef,
                statementType: cashFlowBySlot.statementType,
                accountingPeriod: {
                  startPeriod: accountingPeriod.startPeriod.toISOString(),
                  endPeriod: accountingPeriod.endPeriod.toISOString(),
                },
                total: cashFlowBySlot.income.total,
              };

              summaryNodes.push(incomeStatement);
              break;
            case 'Expense':
              const expenseStatement: CashFlow.SerializableExpenseSummary = {
                id: cashFlowBySlot.id,
                parentRef: cashFlowBySlot.parentRef,
                statementType: cashFlowBySlot.statementType,
                accountingPeriod: {
                  startPeriod: accountingPeriod.startPeriod.toISOString(),
                  endPeriod: accountingPeriod.endPeriod.toISOString(),
                },
                total: cashFlowBySlot.expense.total,
              };

              summaryNodes.push(expenseStatement);
              break;
          }
        }
        state.cashFlowSummaries[parentStatementId] = summaryNodes;
      } catch (error) {
        console.log(getErrorMessage(error));
      }
    },
    updateCashFlowSummaryGraphNode: (
      state,
      action: PayloadAction<CashFlow.UpdateCashFlowSummaryGraphNodeRequest>
    ) => {
      const { parentStatementId, statementId, cashFlowStatementSlotKey } =
        action.payload;

      if (!state.cashFlowSummaries[parentStatementId]) {
        return;
      }
      const selectedCashFlow = state.cashFlows[cashFlowStatementSlotKey];
      if (selectedCashFlow.statementType === 'Summary') {
        const summaryNodes: (
          | CashFlow.SerializableCashFlowSummary
          | CashFlow.SerializableIncomeSummary
          | CashFlow.SerializableExpenseSummary
        )[] = [...state.cashFlowSummaries[parentStatementId]];

        const summaryIndex = summaryNodes.findIndex(
          (summary) => summary.id === statementId
        );
        summaryNodes[summaryIndex] = {
          ...summaryNodes[summaryIndex],
          inflow: selectedCashFlow.income.total,
          outflow: selectedCashFlow.expense.total,
          difference:
            selectedCashFlow.income.total - selectedCashFlow.expense.total,
        };

        state.cashFlowSummaries[parentStatementId] = summaryNodes;
      } else {
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
  buildCashFlowGraph,
  setOverallCashFlow,
  setCashFlow,
  setCashFlowStatementPeriods,
  updateCashFlowSummaryGraphNode,
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
