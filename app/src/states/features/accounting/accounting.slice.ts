import {
  AddAccountingPeriodRequest,
  UserAccountingPeriod,
  UserAccountingPeriodResponse,
} from '@/types/AccountingPeriod';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

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
          state.accountingPeriods.push(addedPeriod);
          state.status = 'succeeded';
        }
      );
  },
});

export const selectStatus = (state: any) => state.accounting.status;
export const selectPresetAccountingPeriods = (state: any) =>
  state.accounting.accountingPeriods;

export default accountingSlice.reducer;
