import { setInitialLoadCompleted } from '@/states/features/cashflow/cashflow.slice';
import { Action, ListenerEffectAPI, PayloadAction } from '@reduxjs/toolkit';
import { AppDispatch, RootState } from '@/states/store';
import { Node } from 'reactflow';
import CashFlow from '@/types/CashFlow';
import { getCashFlows } from '@/states/features/cashflow/getCashFlow.thunk';

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
): void => {};

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

  listenerApi.dispatch(getCashFlows(getCashFlowDetails));
};

export {
  handleInitialCashFlowLoad,
  handleOverallCashFlowUpdate,
  fetchRelevantCashFlowDetails,
};
