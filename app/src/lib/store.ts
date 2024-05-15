import { configureStore } from '@reduxjs/toolkit';
import modalReducer from '../slices/modal-slice';
import transactionReducer from '../slices/transaction-slice';
import { useDispatch, useSelector } from 'react-redux';

export const makeStore = () => {
  return configureStore({
    reducer: {
      modal: modalReducer,
      transaction: transactionReducer,
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
          ignoredPaths: [
            'transaction.budgetSummary.startPeriod',
            'transaction.budgetSummary.endPeriod',
          ],
        },
      }),
  });
};

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
