import {
  setCashFlowSummary,
  setInitialLoadCompleted,
} from '@/states/features/cashflow/cashflow.slice';
import { Action, ListenerEffectAPI, PayloadAction } from '@reduxjs/toolkit';
import { AppDispatch, RootState } from '@/states/store';
import { Node } from 'reactflow';
import CashFlow from '@/types/CashFlow';
import { getCashFlows } from '@/states/features/cashflow/getCashFlow.thunk';
import {
  renderCashFlowNodes,
  resetNodes,
  setOverallCashFlowNode,
} from '@/states/features/cashflow/flow.slice';
import { createCashFlowSummary } from '@/lib/helpers/cashflow.helper';
import { getErrorMessage } from '@/utils/error.utils';
import { openModal } from '@/states/common/modal.slice';
import { getTransactionsForPeriod } from '@/states/features/transaction/getTransactions.thunk';
import Flow from '@/types/Flow';

const handleInitialCashFlowLoad = (
  action: Action,
  listenerApi: ListenerEffectAPI<RootState, AppDispatch>
): void => {
  const currentState = listenerApi.getState();

  const overallCashFlowSummary = currentState.cashflow.overallCashFlowForPeriod;
  const nodes = currentState.flow.nodes;

  listenerApi.dispatch(
    getCashFlows({
      startPeriod: overallCashFlowSummary.startPeriod,
      endPeriod: overallCashFlowSummary.endPeriod,
      reset: true,
      parentStatementSlotId: overallCashFlowSummary.id,
      parentNodeId: nodes[0].id,
    })
  );
  listenerApi.dispatch(setInitialLoadCompleted());
};

const handleOverallCashFlowUpdate = (
  action: Action,
  listenerApi: ListenerEffectAPI<RootState, AppDispatch>
): void => {
  const currentState = listenerApi.getState();
  listenerApi.dispatch(
    setOverallCashFlowNode({
      ...currentState.cashflow.overallCashFlowForPeriod,
    })
  );
};

const handleCashFlowUpdate = (
  action: PayloadAction<CashFlow.SetCashFlowRequest>,
  listenerApi: ListenerEffectAPI<RootState, AppDispatch>
): void => {
  console.log('CashFlowListener: Handling CashFlow Update');
  const { key, total, transactionMode, statementType } = action.payload;
  let currentState = listenerApi.getState();

  const cashFlowForPeriodKey = currentState.cashflow.cashFlows[key];
  if (!cashFlowForPeriodKey) {
    console.error(
      `Error: No cashflow in period ${cashFlowForPeriodKey} found `
    );
    return;
  }
  const cashFlowSummaryParentRef = cashFlowForPeriodKey.parentRef;
  if (!cashFlowSummaryParentRef) {
    return;
  }
  let cashFlowSummaries =
    currentState.cashflow.cashFlowSummaries[cashFlowSummaryParentRef];

  const summaryIndex =
    cashFlowSummaries?.findIndex(
      (summary) => summary.id === cashFlowForPeriodKey.id
    ) ?? -1;

  if (cashFlowSummaries && cashFlowSummaries.length > 0 && summaryIndex > -1) {
    //Update existing summary if it exists.
    const updatedCashFlowSummary = {
      ...cashFlowSummaries[summaryIndex],
    };
    if (statementType === 'Summary') {
      const cashFlowSummary =
        updatedCashFlowSummary as CashFlow.SerializableCashFlowSummary;
      switch (transactionMode) {
        case 'Income':
          cashFlowSummary.inflow = total;
          break;
        case 'Expense':
          cashFlowSummary.outflow = total;
          break;
      }
      cashFlowSummary.difference =
        cashFlowSummary.inflow - cashFlowSummary.outflow;
    } else if (statementType === 'Income') {
      const cashFlowIncomeSummary =
        updatedCashFlowSummary as CashFlow.SerializableIncomeSummary;
      cashFlowIncomeSummary.total = total;
    } else if (statementType === 'Expense') {
      const cashFlowExpenseSummary =
        updatedCashFlowSummary as CashFlow.SerializableExpenseSummary;
      cashFlowExpenseSummary.total = total;
    }

    listenerApi.dispatch(
      setCashFlowSummary({
        parentStatementId: cashFlowSummaryParentRef,
        statementId: cashFlowForPeriodKey.id,
        summaryIndex: summaryIndex,
        updatedCashFlowSummary: updatedCashFlowSummary,
      })
    );
  } else {
    // Create a new summary
    console.log('CashFlowListener: Create new summary');
    listenerApi.dispatch(
      setCashFlowSummary({
        parentStatementId: cashFlowSummaryParentRef,
        statementId: cashFlowForPeriodKey.id,
        summaryIndex: -1,
        updatedCashFlowSummary: createCashFlowSummary(cashFlowForPeriodKey),
      })
    );
  }
  try {
    console.log('CashFlowListener: Rendering/Updating 1 CashFlow Node');
    currentState = listenerApi.getState();
    const cashFlowSummaryToUpdate = currentState.cashflow.cashFlowSummaries[
      cashFlowSummaryParentRef
    ].find((summary) => summary.id === cashFlowForPeriodKey.id);
    const node = currentState.flow.nodes.find(
      (node) => node.data?.id == cashFlowSummaryParentRef
    );
    if (cashFlowSummaryToUpdate && node) {
      listenerApi.dispatch(
        renderCashFlowNodes({
          cashFlowSummaries: [cashFlowSummaryToUpdate],
          fromTargetNodeId: node.id,
        })
      );
    }
  } catch (error) {
    console.log(`CashFlowListener: Error rendering/updating CashFlow nodes. `);
    console.log(`CashFlowListener: ${getErrorMessage(error)}`);
  }
};

const fetchRelevantCashFlowDetails = async (
  action: PayloadAction<Node<Flow.FlowNodeData>>,
  listenerApi: ListenerEffectAPI<RootState, AppDispatch>
): Promise<void> => {
  const node = action.payload;

  if (!node.data) {
    console.log('Node data not initialised');
    return;
  }
  const { id, startPeriod, endPeriod } = node.data;

  console.log('Getting relevant cashflow details');
  const getCashFlowDetails = {
    startPeriod,
    endPeriod,
    reset: false,
    parentNodeId: node.id,
    parentStatementSlotId: id,
  };

  switch (node.data.statementType) {
    case 'Summary':
      await listenerApi.dispatch(getCashFlows(getCashFlowDetails));
      console.log('Get relevant cashflow details completed');
      break;
    case 'Expense':
    case 'Income':
      await listenerApi.dispatch(openModal('TransactionDrawer'));

      await listenerApi.dispatch(
        getTransactionsForPeriod({
          startPeriod: node.data.startPeriod,
          endPeriod: node.data.endPeriod,
        })
      );
      break;
  }
};

const handleCashFlowReset = (
  action: PayloadAction<boolean>,
  listenerApi: ListenerEffectAPI<RootState, AppDispatch>
): void => {
  listenerApi.dispatch(resetNodes(action.payload));
};

export {
  handleInitialCashFlowLoad,
  handleOverallCashFlowUpdate,
  fetchRelevantCashFlowDetails,
  handleCashFlowUpdate,
  handleCashFlowReset,
};
