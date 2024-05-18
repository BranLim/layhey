import { createSlice } from '@reduxjs/toolkit';
import { CashFlowNodeData } from '@/types/CashFlow';
import { Edge, Node } from 'reactflow';

export type FlowViewState = {
  nodes: Node<CashFlowNodeData>[];
  edges: Edge[];
};

const initialState: FlowViewState = {
  nodes: [],
  edges: [],
};

const flowSlice = createSlice({
  name: 'flow',
  initialState: initialState,
  reducers: {},
});

export default flowSlice.reducer;
