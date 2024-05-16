import { createSlice } from '@reduxjs/toolkit';

export type FlowViewState = {};

const initialState: FlowViewState = {};

const flowSlice = createSlice({
  name: 'flow',
  initialState: initialState,
  reducers: {},
});

export default flowSlice.reducer;
