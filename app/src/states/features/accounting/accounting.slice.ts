import {
  GetUserAccountingPeriodsResponse,
  SerializableUserAccountingPeriod,
  UserAccountingPeriod,
} from '@/types/StatementPeriod';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getErrorMessage } from '@/utils/error.utils';
import { addAccountingPeriod } from '@/states/features/accounting/addStatementPeriod.thunk';

export const getAccountingPeriods = createAsyncThunk(
  'accounting/getAccountingPeriods',
  async (args, { rejectWithValue }): Promise<any> => {
    console.log('Called getStatementPeriods');
    try {
      const apiPath = `${process.env.NEXT_PUBLIC_SERVER_URL}/api/accountingperiods`;
      const response = await fetch(apiPath, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        return rejectWithValue(response.statusText);
      }
      const userAccountingPeriodResponse =
        (await response.json()) as GetUserAccountingPeriodsResponse;
      console.log(`Got ${userAccountingPeriodResponse} `);

      return userAccountingPeriodResponse;
    } catch (error) {
      console.error(getErrorMessage(error));
      throw error;
    }
  }
);

type Status =
  | 'idle'
  | 'adding'
  | 'add_complete'
  | 'loading'
  | 'load_complete'
  | 'error';

export type AccountingState = {
  accountingPeriods: SerializableUserAccountingPeriod[];
  isInitialLoadComplete: boolean;
  status: Status;
  error?: any;
};

const initialState: AccountingState = {
  accountingPeriods: [] as SerializableUserAccountingPeriod[],
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
        (state, action: PayloadAction) => {
          state.status = 'add_complete';
        }
      )
      .addCase(getAccountingPeriods.pending, (state, action) => {
        state.status = 'loading';
        state.accountingPeriods = [];
        if (state.error) {
          state.error = undefined;
        }
      })
      .addCase(getAccountingPeriods.fulfilled, (state, action) => {
        const accountingPeriodResponse = action.payload;
        state.accountingPeriods.push(
          ...accountingPeriodResponse.accountingPeriods
        );
        state.isInitialLoadComplete = true;
        state.status = 'load_complete';
      })
      .addCase(getAccountingPeriods.rejected, (state, action) => {
        state.isInitialLoadComplete = true;
        state.status = 'error';
      });
  },
});
export const { reloadUserAccountingPeriod } = accountingSlice.actions;
export const selectIsAccountingPeriodInitialLoadComplete = (state: any) =>
  state.accounting.isInitialLoadComplete;
export const selectAccountingStoreStatus = (state: any) =>
  state.accounting.status;
export const selectPresetAccountingPeriods = (state: any) =>
  state.accounting.accountingPeriods;
export const selectPresetAccountingPeriod = (state: any, id?: string) =>
  id &&
  state.accounting.accountingPeriods.find(
    (accountingPeriod: UserAccountingPeriod) => accountingPeriod.id === id
  );

export default accountingSlice.reducer;
