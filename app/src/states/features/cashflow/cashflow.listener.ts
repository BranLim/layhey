import { setInitialLoadCompleted } from '@/states/features/cashflow/cashflow.slice';
import {
  Action,
  current,
  ListenerEffectAPI,
  PayloadAction,
} from '@reduxjs/toolkit';
import { AppDispatch, RootState } from '@/states/store';
import { Node } from 'reactflow';
import CashFlow from '@/types/CashFlow';
import { getCashFlows } from '@/states/features/cashflow/getCashFlow.thunk';
import { setOverallCashFlowNode } from '@/states/features/cashflow/flow.slice';
import {
  createCashFlowSummary,
  getStatementPeriodFromSlotKey,
} from '@/lib/helpers/cashflow.helper';

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
      append: true,
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
  const { key, total, transactionMode, statementType } = action.payload;
  const currentState = listenerApi.getState();

  //TODO: This does not handle keys with _expense or _income
  const statementPeriod = getStatementPeriodFromSlotKey(key);
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
  const cashFlowSummaries =
    currentState.cashflow.cashFlowSummaries[cashFlowSummaryParentRef];
  const cashFlowSummariesToUpdate: (
    | CashFlow.SerializableCashFlowSummary
    | CashFlow.SerializableIncomeSummary
    | CashFlow.SerializableExpenseSummary
  )[] = cashFlowSummaries ? [...cashFlowSummaries] : [];

  if (cashFlowSummariesToUpdate.length > 0) {
    //If the CashFlowSummary entries exist for a given parent node
    const summaryIndex = cashFlowSummariesToUpdate.findIndex(
      (summary) => summary.id === cashFlowForPeriodKey.id
    );
    if (summaryIndex < 0) {
      //Add summary if it doesn't exists.
      cashFlowSummariesToUpdate[summaryIndex] =
        createCashFlowSummary(cashFlowForPeriodKey);
    } else {
      //Update existing summary if it exists.
      cashFlowSummariesToUpdate[summaryIndex] = {
        ...cashFlowSummariesToUpdate[summaryIndex],
      };
    }
  } else {
    //If the CashFlowSummary entries not exist for a given parent node, insert a new array of CashFlowSummaries
  }
};

const fetchRelevantCashFlowDetails = async (
  action: PayloadAction<Node<CashFlow.CashFlowNodeData>>,
  listenerApi: ListenerEffectAPI<RootState, AppDispatch>
): Promise<void> => {
  console.log('Getting relevant cashflow details');

  const node = action.payload;

  const { id, startPeriod, endPeriod } = node.data;

  const getCashFlowDetails = {
    startPeriod,
    endPeriod,
    append: true,
    parentNodeId: node.id,
    parentStatementSlotId: id,
  };

  await listenerApi.dispatch(getCashFlows(getCashFlowDetails));
  console.log('Get relevant cashflow details completed');
};

export {
  handleInitialCashFlowLoad,
  handleOverallCashFlowUpdate,
  fetchRelevantCashFlowDetails,
};
