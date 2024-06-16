import { addListener, createListenerMiddleware } from '@reduxjs/toolkit';
import { AppDispatch, RootState } from '@/states/store';
import {
  fetchRelevantCashFlowDetails,
  handleCashFlowUpdate,
  handleInitialCashFlowLoad,
  handleOverallCashFlowUpdate,
} from '@/states/features/cashflow/cashflow.listener';
import {
  setCashFlow,
  setOverallCashFlow,
} from '@/states/features/cashflow/cashflow.slice';
import { handleNodeMouseDoubleClick } from '@/states/features/cashflow/flow.slice';

export const listenerMiddleware = createListenerMiddleware();
export const startAppListening = listenerMiddleware.startListening.withTypes<
  RootState,
  AppDispatch
>();
export const addAppListener = addListener.withTypes<RootState, AppDispatch>();

startAppListening({
  predicate: (action, currentState, previousState) => {
    return (
      !currentState.cashflow.initialLoad &&
      currentState.cashflow.status === 'completed_get_overall_cashflow'
    );
  },
  effect: handleInitialCashFlowLoad,
});

startAppListening({
  actionCreator: setOverallCashFlow,
  effect: handleOverallCashFlowUpdate,
});

startAppListening({
  actionCreator: setCashFlow,
  effect: handleCashFlowUpdate,
});
startAppListening({
  actionCreator: handleNodeMouseDoubleClick,
  effect: fetchRelevantCashFlowDetails,
});
