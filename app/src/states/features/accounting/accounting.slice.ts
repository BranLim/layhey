import {
  AccountingPeriod,
  AddAccountingPeriodRequest,
  GetUserAccountingPeriodsResponse,
  UserAccountingPeriod,
  UserAccountingPeriodResponse,
} from '@/types/AccountingPeriod';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { toUserAccountingPeriodResponse } from '@/lib/mappers/accountingPeriod.mapper';

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

export const getAccountPeriods = createAsyncThunk(
  'accounting/getAccountingPeriods',
  async (): Promise<GetUserAccountingPeriodsResponse> => {
    const apiPath = `${process.env.NEXT_PUBLIC_SERVER_URL}/api/accountingperiods`;
    const response = await fetch(apiPath, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Error adding new transaction');
    }
    const userAccountingPeriodResponse =
      (await response.json()) as GetUserAccountingPeriodsResponse;

    return userAccountingPeriodResponse;
  }
);

type AccountingState = {
  accountingPeriods: UserAccountingPeriod[];
  status: 'idle' | 'adding' | 'loading' | 'succeeded' | 'error';
  error?: any;
};

const initialState: AccountingState = {
  accountingPeriods: [] as UserAccountingPeriod[],
  status: 'idle',
};

const accountingSlice = createSlice({
  name: 'accounting',
  initialState,
  reducers: {},
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
            startPeriod: new Date(addedPeriod.startPeriod),
            endPeriod: new Date(addedPeriod.endPeriod),
          });
          state.status = 'succeeded';
        }
      );
  },
});

export const selectStatus = (state: any) => state.accounting.status;
export const selectPresetAccountingPeriods = (state: any) =>
  state.accounting.accountingPeriods;
export const selectPresetAccountingPeriod = (state: any, id: string) =>
  state.accounting.accountingPeriods.find(
    (accountingPeriod: UserAccountingPeriod) => accountingPeriod.id === id
  );

export default accountingSlice.reducer;
