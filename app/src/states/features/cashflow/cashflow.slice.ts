import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TransactionMode } from '@/types/Transaction';
import CashFlow from '@/types/CashFlow';
import { StatementPeriodSlot } from '@/types/AccountingPeriod';
import { v4 as uuidv4 } from 'uuid';
import { addTransaction } from '@/states/features/cashflow/addCashFlow.thunk';
import { getCashFlows } from '@/states/features/cashflow/getCashFlow.thunk';
import { getOverallCashFlowSummary } from '@/states/features/cashflow/getOverallCashFlowSummary.thunk';

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

export type CashFlowState = {
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
    setCashFlow: (
      state,
      action: PayloadAction<CashFlow.SetCashFlowRequest>
    ) => {
      const { key, total, parentKey, transactionMode, statementType } =
        action.payload;

      switch (statementType) {
        case 'Summary':
          const cashFlowStatement = state.cashFlows[
            key
          ] as CashFlow.CashFlowStatement;

          switch (transactionMode) {
            case TransactionMode.Income:
              cashFlowStatement.parentRef = parentKey;
              cashFlowStatement.income.total = total;
              break;
            case TransactionMode.Expense:
              cashFlowStatement.parentRef = parentKey;
              cashFlowStatement.expense.total = total;
              break;
          }
          break;
        case 'Income':
          (state.cashFlows[key] as CashFlow.IncomeStatement).parentRef =
            parentKey;
          (state.cashFlows[key] as CashFlow.IncomeStatement).income.total =
            total;
          break;
        case 'Expense':
          (state.cashFlows[key] as CashFlow.ExpenseStatement).parentRef =
            parentKey;
          (state.cashFlows[key] as CashFlow.ExpenseStatement).expense.total =
            total;
          break;
      }
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
    setCashFlowSummary: (
      state,
      action: PayloadAction<CashFlow.SetCashFlowSummaryRequest>
    ) => {
      console.log('Setting CashFlow Summary...');
      const {
        parentStatementId,
        statementId,
        summaryIndex,
        updatedCashFlowSummary,
      } = action.payload;

      const cashFlowSummaries = state.cashFlowSummaries[parentStatementId];
      if (cashFlowSummaries) {
        console.log(
          `SetCashFlowSummary: Found existing cashflow summaries for parentStatementId: ${parentStatementId}`
        );
        const cashFlowSummariesToUpdate: (
          | CashFlow.SerializableCashFlowSummary
          | CashFlow.SerializableIncomeSummary
          | CashFlow.SerializableExpenseSummary
        )[] = [...cashFlowSummaries];
        console.log(`SetCashFlowSummary: Summary Index is: ${summaryIndex}`);
        if (summaryIndex > -1) {
          console.log('SetCashFlowSummary: Updating existing summaries');
          cashFlowSummariesToUpdate[summaryIndex] = updatedCashFlowSummary;
        } else {
          console.log(
            `SetCashFlowSummary: Inserting new Summary \n ${JSON.stringify(updatedCashFlowSummary)}`
          );
          cashFlowSummariesToUpdate.push(updatedCashFlowSummary);
        }
        state.cashFlowSummaries[parentStatementId] = cashFlowSummariesToUpdate;
      } else {
        state.cashFlowSummaries[parentStatementId] = [updatedCashFlowSummary];
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
  setOverallCashFlow,
  setCashFlow,
  setCashFlowStatementPeriods,
  setCashFlowSummary,
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

export default cashflowSlice.reducer;
