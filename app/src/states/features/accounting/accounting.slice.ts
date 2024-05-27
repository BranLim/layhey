import {
  AddAccountingPeriodRequest,
  UserAccountingPeriod,
  UserAccountingPeriodResponse,
} from '@/types/AccountingPeriod';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

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
  accountingPeriod: UserAccountingPeriod[];
};

const initialState: AccountingState = {
  accountingPeriod: [] as UserAccountingPeriod[],
};

const accountingSlice = createSlice({
  name: 'accounting',
  initialState,
  reducers: {},
});

export default accountingSlice.reducer;
