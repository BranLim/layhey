import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CashFlowNodeData, CashFlowSummaryState } from '@/types/CashFlow';
import {
  Edge,
  Node,
  NodePositionChange,
  NodeSelectionChange,
  Position,
} from 'reactflow';

export type FlowPayload = {
  rootCashFlowSummary: CashFlowSummaryState;
  cashFlowSummaries: CashFlowSummaryState[];
};

export type FlowViewState = {
  nodes: Node<CashFlowNodeData>[];
  edges: Edge[];
  selectedNode?: Node<CashFlowNodeData>;
  nodeStyles: Record<string, any>;
};

const initialState: FlowViewState = {
  nodes: [],
  edges: [],
  nodeStyles: {},
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
          rootNode: true,
        },
      };
      state.nodeStyles[rootNode.id] = {
        borderColor: 'black',
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
        state.nodeStyles[node.id] = {
          borderColor: 'black',
        };
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
      state.nodes = cashFlowNodes;
      state.edges = cashFlowEdges;
    },
    handleNodeMouseEnter: (state, action: PayloadAction<Node>) => {
      const mouseEnteredNode = action.payload;
      const foundNodeStyle = state.nodeStyles[mouseEnteredNode.id];
      if (foundNodeStyle) {
        foundNodeStyle['borderColor'] = 'darkslategray';
        foundNodeStyle['boxShadow'] = '0px 0px 12px darkgray';
      }
    },
    handleNodeMouseLeave: (state, action: PayloadAction<Node>) => {
      const mouseLeaveNode = action.payload;
      const foundNodeStyle = state.nodeStyles[mouseLeaveNode.id];
      if (foundNodeStyle) {
        foundNodeStyle['borderColor'] = 'black';
        foundNodeStyle['boxShadow'] = '0px 0px 10px darkslategray';
      }
    },
    handleNodeSelection: (
      state,
      action: PayloadAction<NodeSelectionChange>
    ) => {
      const changeEvent = action.payload;
      const foundNode = state.nodes.find((node) => node.id === changeEvent.id);
      if (foundNode) {
        foundNode.selected = changeEvent.selected;
        state.selectedNode = foundNode;
      }
    },
    handleNodeMove: (state, action: PayloadAction<NodePositionChange>) => {
      const changeEvent = action.payload;
      const foundNode = state.nodes.find((node) => node.id === changeEvent.id);
      if (foundNode) {
        if (changeEvent.position) {
          foundNode.position = changeEvent.position;
          foundNode.positionAbsolute = changeEvent.positionAbsolute;
        }
      }
    },
  },
});

export const {
  setCashFlows,
  handleNodeSelection,
  handleNodeMove,
  handleNodeMouseEnter,
  handleNodeMouseLeave,
} = flowSlice.actions;
export const selectFlowNodes = (state: any) => state.flow.nodes;
export const selectFlowEdges = (state: any) => state.flow.edges;
export const selectNodeStyle = (state: any, nodeId: string) =>
  state.flow.nodeStyles[nodeId];

export default flowSlice.reducer;
