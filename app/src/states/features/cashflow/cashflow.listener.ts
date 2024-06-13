import {
  getCashFlowBreakdown,
  getCashFlows,
  setInitialLoadCompleted,
} from '@/states/features/cashflow/cashflow.slice';
import { Action, ListenerEffectAPI, PayloadAction } from '@reduxjs/toolkit';
import { AppDispatch, RootState } from '@/states/store';
import { Node } from 'reactflow';
import CashFlow from '@/types/CashFlow';
import { Accounting_Period_One_Day_In_Milliseconds } from '@/types/AccountingPeriod';

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

const fetchRelevantCashFlowDetails = async (
  action: PayloadAction<Node<CashFlow.CashFlowNodeData>>,
  listenerApi: ListenerEffectAPI<RootState, AppDispatch>
): Promise<void> => {
  console.log('Getting relevant cashflow details');

  const node = action.payload;

  const { id, startPeriod, endPeriod } = node.data;

  const startDate = new Date(startPeriod);
  const endDate = new Date(endPeriod);

  const getCashFlowDetails = {
    startPeriod,
    endPeriod,
    append: true,
    parentNodeId: node.id,
    parentStatementSlotId: id,
  };

  if (
    endDate.getTime() - startDate.getTime() <=
    Accounting_Period_One_Day_In_Milliseconds
  ) {
    listenerApi.dispatch(getCashFlowBreakdown(getCashFlowDetails));
    return;
  }
  listenerApi.dispatch(getCashFlows(getCashFlowDetails));
};

export { handleInitialCashFlowLoad, fetchRelevantCashFlowDetails };
