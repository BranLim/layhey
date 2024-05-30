import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CashFlowNodeData, CashFlowSummaryState } from '@/types/CashFlow';
import {
  Edge,
  MarkerType,
  Node,
  NodePositionChange,
  NodeSelectionChange,
  Position,
} from 'reactflow';
import { v4 as uuidv4 } from 'uuid';
import {
  AccountingPeriod,
  SerializableAccountingPeriod,
} from '@/types/AccountingPeriod';

const edgeColor = 'lightgray';

const edgeStyle = {
  strokeWidth: 2,
  stroke: edgeColor,
};

const edgeMarkerEnd = {
  type: MarkerType.ArrowClosed,
  width: 20,
  height: 20,
  color: edgeColor,
};

export type FlowPayload = {
  rootCashFlowSummary: CashFlowSummaryState;
  cashFlowSummaries: CashFlowSummaryState[];
};

export type FlowViewState = {
  currentChosenAccountingPeriod: SerializableAccountingPeriod;
  nodes: Node<CashFlowNodeData>[];
  edges: Edge[];
  selectedNode?: Node<CashFlowNodeData>;
  nodeStyles: Record<string, any>;
};

const initialState: FlowViewState = {
  currentChosenAccountingPeriod: {
    startPeriod: '',
    endPeriod: '',
  },
  nodes: [],
  edges: [],
  nodeStyles: {},
};

const flowSlice = createSlice({
  name: 'flow',
  initialState: initialState,
  reducers: {
    setCurrentAccountingPeriod: (
      state,
      action: PayloadAction<SerializableAccountingPeriod>
    ) => {
      const accountingPeriod = action.payload;
      if (accountingPeriod) {
        state.currentChosenAccountingPeriod = accountingPeriod;
      }
    },
    setCashFlows: (state, action: PayloadAction<FlowPayload>) => {
      const { rootCashFlowSummary, cashFlowSummaries } = action.payload;

      const cashFlowNodes: Node<CashFlowNodeData>[] = [];
      const cashFlowEdges: Edge[] = [];

      const rootNode: Node<CashFlowNodeData> = {
        id: uuidv4(),
        type: 'cashFlowNode',
        position: { x: 0, y: 10 },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
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
        border: '3px solid black',
      };
      cashFlowNodes.push(rootNode);

      let index = 2;
      let y = 10;
      for (const cashFlowSummary of cashFlowSummaries) {
        const node: Node<CashFlowNodeData> = {
          id: uuidv4(),
          type: 'cashFlowNode',
          position: { x: 480, y: y },
          sourcePosition: Position.Right,
          targetPosition: Position.Left,
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
          border: '3px solid black',
        };
        y += 180;

        const edge: Edge = {
          type: 'smoothstep',
          target: rootNode.id,
          source: node.id,
          id: `edge-${index}`,
          markerEnd: edgeMarkerEnd,
          style: edgeStyle,
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
        foundNodeStyle['border'] = '4px solid dimgray';
        foundNodeStyle['boxShadow'] = '0px 0px 16px lightslategray';
      }
    },
    handleNodeMouseLeave: (state, action: PayloadAction<Node>) => {
      const mouseLeaveNode = action.payload;
      const foundNodeStyle = state.nodeStyles[mouseLeaveNode.id];

      if (foundNodeStyle) {
        foundNodeStyle['border'] = '3px solid black';
        foundNodeStyle['boxShadow'] = '0px 0px 12px darkslategray';
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
      }
      if (changeEvent.selected) {
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
  setCurrentAccountingPeriod,
  setCashFlows,
  handleNodeSelection,
  handleNodeMove,
  handleNodeMouseEnter,
  handleNodeMouseLeave,
} = flowSlice.actions;
export const selectCurrentAccountingPeriod = (state: any) =>
  state.flow.currentChosenAccountingPeriod;
export const selectFlowNodes = (state: any) => state.flow.nodes;
export const selectFlowEdges = (state: any) => state.flow.edges;
export const selectNodeStyle = (state: any, nodeId: string) =>
  state.flow.nodeStyles[nodeId];

export default flowSlice.reducer;
