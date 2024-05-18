import { configureStore } from '@reduxjs/toolkit';
import modalReducer from '@/states/common/modal-slice';
import cashflowReducer from '@/states/features/cashflow/cashflow-slice';
import flowReducer from './features/cashflow/flow-slice';

export const makeStore = () => {
  return configureStore({
    reducer: {
      modal: modalReducer,
      flow: flowReducer,
      cashflow: cashflowReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActionPaths: [
            'meta.arg.startPeriod',
            'meta.arg.endPeriod',
            'payload.startPeriod',
            'payload.endPeriod',
          ],
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
