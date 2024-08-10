import {
  SerializableUserStatementPeriod,
  UserStatementPeriod,
} from '@/types/StatementPeriod';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { addAccountingPeriod } from '@/states/features/accounting/addStatementPeriod.thunk';
import { getAccountingPeriods } from '@/states/features/accounting/getStatementPeriods.thunk';
import { Draft } from 'immer';

type Status =
  | 'idle'
  | 'adding'
  | 'add_complete'
  | 'loading'
  | 'load_complete'
  | 'error';

export type AccountingState = {
  statementPeriods: SerializableUserStatementPeriod[];
  isInitialLoadComplete: boolean;
  status: Status;
  error?: any;
};

const initialState: AccountingState = {
  statementPeriods: [] as SerializableUserStatementPeriod[],
  isInitialLoadComplete: false,
  status: 'idle',
};

const accountingSlice = createSlice({
  name: 'accounting',
  initialState,
  reducers: {
    reloadUserAccountingPeriod: (state, action) => {
      state.isInitialLoadComplete = false;
    },
    addStatementPeriod: (
      state: Draft<AccountingState>,
      action: PayloadAction<SerializableUserStatementPeriod>
    ) => {
      const statementPeriod = action.payload;
      state.statementPeriods.push(statementPeriod);
    },
    setStatementPeriods: (
      state: Draft<AccountingState>,
      action: PayloadAction<SerializableUserStatementPeriod[]>
    ) => {
      const statementPeriods = action.payload;
      state.statementPeriods.length = 0;
      state.statementPeriods.push(...statementPeriods);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addAccountingPeriod.rejected, (state, action) => {})
      .addCase(addAccountingPeriod.pending, (state, action) => {
        state.status = 'adding';
        if (state.error) {
          state.error = undefined;
        }
      })
      .addCase(
        addAccountingPeriod.fulfilled,
        (state: Draft<AccountingState>, action: PayloadAction) => {
          state.status = 'add_complete';
        }
      )
      .addCase(
        getAccountingPeriods.pending,
        (state: Draft<AccountingState>, action) => {
          state.status = 'loading';
          state.statementPeriods.length = 0;
          if (state.error) {
            state.error = undefined;
          }
        }
      )
      .addCase(
        getAccountingPeriods.fulfilled,
        (state: Draft<AccountingState>, action) => {
          state.isInitialLoadComplete = true;
          state.status = 'load_complete';
        }
      )
      .addCase(
        getAccountingPeriods.rejected,
        (state: Draft<AccountingState>, action) => {
          state.isInitialLoadComplete = true;
          state.status = 'error';
        }
      );
  },
});
export const {
  reloadUserAccountingPeriod,
  addStatementPeriod,
  setStatementPeriods,
} = accountingSlice.actions;

export const selectAccountingStoreStatus = (state: any) =>
  state.accounting.status;
export const selectPresetStatementPeriods = (state: any) =>
  state.accounting.accountingPeriods;
export const selectPresetAccountingPeriod = (state: any, id?: string) =>
  id &&
  state.accounting.accountingPeriods.find(
    (accountingPeriod: UserStatementPeriod) => accountingPeriod.id === id
  );

export default accountingSlice.reducer;
