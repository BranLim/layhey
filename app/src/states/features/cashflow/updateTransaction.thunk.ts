import { createAsyncThunk } from '@reduxjs/toolkit';
import { FlowViewState } from '@/states/features/cashflow/flow.slice';
import { CashFlowState } from '@/states/features/cashflow/cashflow.slice';
import { UpdateTransactionRequest } from '@/types/Transaction';
import { updateTransactionApi } from '@/api/transactions.api';
import { getOverallCashFlowSummary } from '@/states/features/cashflow/getOverallCashFlowSummary.thunk';
import { getErrorMessage } from '@/utils/error.utils';
import { isDateWithin } from '@/utils/date.utils';
import { state } from 'sucrase/dist/types/parser/traverser/base';
import { getCashFlows } from '@/states/features/cashflow/getCashFlow.thunk';

export const updateTransaction = createAsyncThunk<
  void,
  UpdateTransactionRequest,
  { state: { cashflow: CashFlowState; flow: FlowViewState } }
>(
  'caashflow/updateTransaction',
  async (
    updateTransactionRequest: UpdateTransactionRequest,
    { dispatch, getState }
  ): Promise<void> => {
    try {
      const updatedTransaction = await updateTransactionApi(
        updateTransactionRequest
      );

      let currentState = getState();

      const expenseStartPeriod: string =
        currentState.cashflow.overallCashFlowForPeriod.startPeriod;
      const expenseEndPeriod: string =
        currentState.cashflow.overallCashFlowForPeriod.endPeriod;

      dispatch(
        getOverallCashFlowSummary({
          startPeriod: expenseStartPeriod,
          endPeriod: expenseEndPeriod,
          parentNodeId: '',
          parentStatementSlotId: '',
          reset: false,
        })
      );

      /*
       * Find all the Periods (if their nodes exists in the graph)
       * Then update the nodes' data
       */
      currentState = getState();
      const currentCashFlows = currentState.cashflow.cashFlows;
      const cashflows = Object.values(currentCashFlows).filter((statement) =>
        isDateWithin(
          new Date(updateTransactionRequest.transaction.date),
          new Date(statement.accountingPeriod.startPeriod),
          new Date(statement.accountingPeriod.endPeriod)
        )
      );
      for (const cashflow of cashflows) {
        console.log(JSON.stringify(cashflow));
        await dispatch(
          getCashFlows({
            startPeriod: cashflow.accountingPeriod.startPeriod,
            endPeriod: cashflow.accountingPeriod.endPeriod,
            reset: false,
            parentStatementSlotId: cashflow.parentRef ?? '',
            parentNodeId: '',
          })
        );
      }
    } catch (error) {
      console.log('Error updating transaction');
      console.log(getErrorMessage(error));
    }
  }
);
