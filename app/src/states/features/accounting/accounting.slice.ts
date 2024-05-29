import {
  AccountingPeriod,
  AddAccountingPeriodRequest,
  GetUserAccountingPeriodsResponse,
  SerializableUserAccountingPeriod,
  UserAccountingPeriod,
  UserAccountingPeriodResponse,
} from '@/types/AccountingPeriod';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { toUserAccountingPeriodResponse } from '@/lib/mappers/accountingPeriod.mapper';
import { getErrorMessage } from '@/utils/error.utils';

export const addAccountingPeriod = createAsyncThunk(
  'accounting/addAccountingPeriod',
  async (
    newAccountingPeriod: AddAccountingPeriodRequest
  ): Promise<UserAccountingPeriodResponse> => {
    const apiPath = `${process.env.NEXT_PUBLIC_SERVER_URL}/api/accountingperiods`;
    const response = await fetch(apiPath, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(newAccountingPeriod),
    });

    if (!response.ok) {
      throw new Error('Error adding new transaction');
    }
    const userAccountingPeriod =
      (await response.json()) as UserAccountingPeriodResponse;
    return userAccountingPeriod;
  }
);

export const getAccountingPeriods = createAsyncThunk(
  'accounting/getAccountingPeriods',
  async (args, { rejectWithValue }): Promise<any> => {
    console.log('Get Accounting Periods called...');
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

type AccountingState = {
  accountingPeriods: SerializableUserAccountingPeriod[];
  isInitialLoadComplete: boolean;
  status: 'idle' | 'adding' | 'loading' | 'succeeded' | 'error';
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
    reloadUserAccountingPeriod: (
      state,
      action: PayloadAction<AccountingState>
    ) => {
      state.isInitialLoadComplete = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addAccountingPeriod.pending, (state, action) => {
        state.status = 'adding';
        if (state.error) {
          state.error = undefined;
        }
      })
      .addCase(
        addAccountingPeriod.fulfilled,
        (state, action: PayloadAction<UserAccountingPeriodResponse>) => {
          const addedPeriod = action.payload;
          state.accountingPeriods.push({
            ...addedPeriod,
            startPeriod: addedPeriod.startPeriod,
            endPeriod: addedPeriod.endPeriod,
          });
          state.status = 'succeeded';
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
        state.status = 'succeeded';
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
export const selectPresetAccountingPeriod = (state: any, id: string) =>
  state.accounting.accountingPeriods.find(
    (accountingPeriod: UserAccountingPeriod) => accountingPeriod.id === id
  );

export default accountingSlice.reducer;
