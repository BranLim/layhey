import { configureStore } from '@reduxjs/toolkit';
import modalReducer from '@/states/common/modal.slice';
import cashflowReducer from '@/states/features/cashflow/cashflow.slice';
import flowReducer from './features/cashflow/flow.slice';
import accountingReducer from './features/accounting/accounting.slice';

export const makeStore = () => {
  return configureStore({
    reducer: {
      modal: modalReducer,
      flow: flowReducer,
      cashflow: cashflowReducer,
      accounting: accountingReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActionPaths: [],
          ignoredActions: [],
          ignoredPaths: [],
        },
      }),
  });
};

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
