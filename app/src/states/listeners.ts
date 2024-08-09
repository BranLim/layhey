import { addListener, createListenerMiddleware } from '@reduxjs/toolkit';
import { AppDispatch, RootState } from '@/states/store';
import {
  fetchRelevantCashFlowDetails,
  handleCashFlowReset,
  handleCashFlowUpdate,
  handleInitialCashFlowLoad,
  handleOverallCashFlowUpdate,
} from '@/states/features/cashflow/cashflow.listener';
import {
  reset,
  setCashFlow,
  setOverallCashFlow,
} from '@/states/features/cashflow/cashflow.slice';
import { handleNodeMouseDoubleClick } from '@/states/features/cashflow/flow.slice';
import { updateTransaction } from '@/states/features/transaction/transaction.slice';
import { handleUpdateTransaction } from '@/states/features/transaction/transaction.listener';

export const listenerMiddleware = createListenerMiddleware();
export const startAppListening = listenerMiddleware.startListening.withTypes<
  RootState,
  AppDispatch
>();
export const addAppListener = addListener.withTypes<RootState, AppDispatch>();

startAppListening({
  predicate: (action, currentState) => {
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
startAppListening({
  actionCreator: reset,
  effect: handleCashFlowReset,
});
startAppListening({
  actionCreator: updateTransaction,
  effect: handleUpdateTransaction,
});
