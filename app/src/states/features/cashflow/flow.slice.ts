import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  CashFlowNodeData,
  SerializableCashFlowSummary,
} from '@/types/CashFlow';
import {
  Edge,
  MarkerType,
  Node,
  NodePositionChange,
  NodeSelectionChange,
  Position,
} from 'reactflow';
import { v4 as uuidv4 } from 'uuid';
import { SerializableAccountingPeriod } from '@/types/AccountingPeriod';

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
  rootCashFlowSummary: SerializableCashFlowSummary;
  cashFlowSummaries: SerializableCashFlowSummary[];
};

export type AddCashFlowPayload = {
  cashFlowSummaries: SerializableCashFlowSummary[];
  targetNodeId: string;
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

const applyDefaultNodeStyle = (state: any, nodeId: string) => {
  state.nodeStyles[nodeId] = {
    border: '3px solid black',
  };
};

const sortCashFlowSummaries = (
  cashFlowSummaries: SerializableCashFlowSummary[]
) => {
  return cashFlowSummaries.sort((summary1, summary2) => {
    const start = new Date(summary1.startPeriod);
    const start2 = new Date(summary2.startPeriod);
    const end = new Date(summary1.endPeriod);
    const end2 = new Date(summary2.endPeriod);

    if (end > end2) {
      return -1;
    }
    if (end < end2) {
      return 1;
    }

    if (start > start2) {
      return -1;
    }
    if (start < start2) {
      return 1;
    }

    return 0;
  });
};

const generateCashFlowNodes = (
  state: any,
  cashFlowSummaries: SerializableCashFlowSummary[]
): Node<CashFlowNodeData>[] => {
  const cashFlowNodes: Node<CashFlowNodeData>[] = [];
  let y = 10;
  for (const cashFlowSummary of cashFlowSummaries) {
    const node: Node<CashFlowNodeData> = {
      id: `node-${uuidv4()}`,
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
    applyDefaultNodeStyle(state, node.id);
    y += 180;
  }
  return cashFlowNodes;
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
    setInitialCashFlows: (state, action: PayloadAction<FlowPayload>) => {
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
      applyDefaultNodeStyle(state, rootNode.id);
      cashFlowNodes.push(rootNode);

      const sortedCashFlowSummaries = sortCashFlowSummaries(cashFlowSummaries);

      generateCashFlowNodes(state, sortedCashFlowSummaries);

      let y = 10;
      for (const cashFlowSummary of sortedCashFlowSummaries) {
        const node: Node<CashFlowNodeData> = {
          id: `node-${uuidv4()}`,
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
        applyDefaultNodeStyle(state, node.id);
        y += 180;

        const edge: Edge = {
          type: 'smoothstep',
          target: rootNode.id,
          source: node.id,
          id: `edge-${uuidv4()}`,
          markerEnd: edgeMarkerEnd,
          style: edgeStyle,
        };
        cashFlowEdges.push(edge);
      }
      state.nodes = cashFlowNodes;
      state.edges = cashFlowEdges;
    },
    addCashFlows: (state, action: PayloadAction<AddCashFlowPayload>) => {
      const { targetNodeId, cashFlowSummaries } = action.payload;

      const edges: Edge[] = [];
      const sortedCashFlowSummaries = sortCashFlowSummaries(cashFlowSummaries);

      state.edges.push(...edges);
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
  setInitialCashFlows,
  addCashFlows,
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
