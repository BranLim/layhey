import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CashFlowNodeData, CashFlowSummary } from '@/types/CashFlow';
import {
  applyNodeChanges,
  Edge,
  Node,
  NodeChange,
  NodePositionChange,
  NodeSelectionChange,
  OnNodesChange,
  Position,
} from 'reactflow';

export type FlowPayload = {
  rootCashFlowSummary: CashFlowSummary;
  cashFlowSummaries: CashFlowSummary[];
};

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
  reducers: {
    setCashFlows: (state, action: PayloadAction<FlowPayload>) => {
      const { rootCashFlowSummary, cashFlowSummaries } = action.payload;

      const cashFlowNodes: Node<CashFlowNodeData>[] = [];
      const cashFlowEdges: Edge[] = [];

      const rootNode: Node<CashFlowNodeData> = {
        id: 'node-1',
        type: 'budgetNode',
        position: { x: 200, y: 200 },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
        draggable: true,
        focusable: true,
        data: {
          startPeriod: rootCashFlowSummary.startPeriod,
          endPeriod: rootCashFlowSummary.endPeriod,
          inflow: rootCashFlowSummary.inflow,
          outflow: rootCashFlowSummary.outflow,
          difference: rootCashFlowSummary.difference,
          currency: 'SGD',
        },
      };
      cashFlowNodes.push(rootNode);

      let index = 2;
      let x = 100;
      for (const cashFlowSummary of cashFlowSummaries) {
        const node: Node<CashFlowNodeData> = {
          id: `node-${index}`,
          type: 'budgetNode',
          position: { x: x, y: 450 },
          sourcePosition: Position.Bottom,
          targetPosition: Position.Top,
          draggable: true,
          focusable: true,
          data: {
            startPeriod: cashFlowSummary.startPeriod,
            endPeriod: cashFlowSummary.endPeriod,
            inflow: cashFlowSummary.inflow,
            outflow: cashFlowSummary.outflow,
            difference: cashFlowSummary.difference,
            currency: cashFlowSummary.currency,
          },
        };
        cashFlowNodes.push(node);
        x += 400;

        const edge: Edge = {
          type: 'default',
          target: 'node-1',
          source: node.id,
          id: `edge-${index}`,
        };
        cashFlowEdges.push(edge);

        index++;
      }
      state.nodes.push(...cashFlowNodes);
      state.edges.push(...cashFlowEdges);
    },
    handleNodeSelection: (
      state,
      action: PayloadAction<NodeSelectionChange>
    ) => {
      const changeEvent = action.payload;
      const foundNode = state.nodes.find((node) => node.id === changeEvent.id);
      if (foundNode) {
        foundNode.selected = changeEvent.selected;
      }
    },
    handleNodeMove: (state, action: PayloadAction<NodePositionChange>) => {
      const changeEvent = action.payload;
      const foundNode = state.nodes.find((node) => node.id === changeEvent.id);
      if (foundNode && changeEvent.position) {
        foundNode.position = changeEvent.position;
      }
    },
  },
});

export const { setCashFlows, handleNodeSelection, handleNodeMove } =
  flowSlice.actions;
export const selectFlowNodes = (state: any) => state.flow.nodes;
export const selectFlowEdges = (state: any) => state.flow.edges;

export default flowSlice.reducer;
