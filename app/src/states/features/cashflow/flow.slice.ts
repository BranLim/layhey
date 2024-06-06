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

export type FlowViewStatus =
  | 'initial_node_load'
  | 'initial_node_load_complete'
  | 'post_add_transaction'
  | 'node_expansion'
  | 'node_expansion_processing'
  | 'node_expansion_completed';

export type FlowViewState = {
  currentChosenAccountingPeriod: SerializableAccountingPeriod;
  expandedNodes: Array<string>;
  nodes: Node<CashFlowNodeData>[];
  edges: Edge[];
  selectedNode?: Node<CashFlowNodeData>;
  nodeStyles: Record<string, any>;
  flowViewStatus: FlowViewStatus;
};

const initialState: FlowViewState = {
  currentChosenAccountingPeriod: {
    startPeriod: '',
    endPeriod: '',
  },
  expandedNodes: Array<string>(),
  nodes: Array<Node<CashFlowNodeData>>(),
  edges: Array<Edge>(),
  nodeStyles: {},
  flowViewStatus: 'initial_node_load',
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
  cashFlowSummaries: SerializableCashFlowSummary[],
  xInitialPos: number,
  yInitialPos: number
): Node<CashFlowNodeData>[] => {
  const cashFlowNodes: Node<CashFlowNodeData>[] = [];
  let y = yInitialPos;
  for (const cashFlowSummary of cashFlowSummaries) {
    const node: Node<CashFlowNodeData> = {
      id: `node-${uuidv4()}`,
      type: 'cashFlowNode',
      position: { x: xInitialPos, y: y },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      draggable: true,
      focusable: true,
      data: {
        id: cashFlowSummary.id,
        parentRef: cashFlowSummary.parentRef,
        statementType: cashFlowSummary.statementType,
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

const generateNodeEdges = (
  targetNodeId: string,
  childrenNodeIds: string[]
): Edge[] => {
  const cashFlowEdges: Edge[] = [];
  for (const childrenId of childrenNodeIds) {
    const edge: Edge = {
      type: 'smoothstep',
      target: targetNodeId,
      source: childrenId,
      id: `edge-${uuidv4()}`,
      markerEnd: edgeMarkerEnd,
      style: edgeStyle,
    };
    cashFlowEdges.push(edge);
  }
  return cashFlowEdges;
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
      state.expandedNodes = [];

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
          id: rootCashFlowSummary.id,
          parentRef: rootCashFlowSummary.parentRef,
          statementType: rootCashFlowSummary.statementType,
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
      const generatedCashFlowNodes = generateCashFlowNodes(
        state,
        sortedCashFlowSummaries,
        480,
        10
      );
      const generatedNodeEdges = generateNodeEdges(
        rootNode.id,
        generatedCashFlowNodes.map((node) => node.id)
      );

      cashFlowNodes.push(...generatedCashFlowNodes);
      cashFlowEdges.push(...generatedNodeEdges);

      state.nodes = cashFlowNodes;
      state.edges = cashFlowEdges;
      state.flowViewStatus = 'initial_node_load_complete';
    },
    addCashFlows: (state, action: PayloadAction<AddCashFlowPayload>) => {
      state.flowViewStatus = 'node_expansion_processing';

      const { targetNodeId, cashFlowSummaries } = action.payload;

      const nodes: Node<CashFlowNodeData>[] = [...state.nodes];
      const edges: Edge[] = [...state.edges];

      const targetNode = nodes.find((node) => node.id === targetNodeId);
      const sortedCashFlowSummaries = sortCashFlowSummaries(cashFlowSummaries);
      const generatedCashFlowNodes = generateCashFlowNodes(
        state,
        sortedCashFlowSummaries,
        (targetNode?.position.x ?? 0) + 480,
        (targetNode?.position.y ?? 0) + 10
      );
      const generatedEdges = generateNodeEdges(
        targetNodeId,
        generatedCashFlowNodes.map((node) => node.id)
      );

      nodes.push(...generatedCashFlowNodes);
      edges.push(...generatedEdges);

      state.nodes = nodes;
      state.edges = edges;
      state.flowViewStatus = 'node_expansion_completed';
    },
    setFlowViewToPostAdd: (state) => {
      state.flowViewStatus = 'post_add_transaction';
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
      if (foundNode && changeEvent.position) {
        foundNode.position = changeEvent.position;
        foundNode.positionAbsolute = changeEvent.positionAbsolute;
      }
    },
    handleNodeMouseDoubleClick: (state, action: PayloadAction<Node>) => {
      const nodeDoubleClicked = action.payload;
      const foundNode = state.nodes.find(
        (node) => node.id === nodeDoubleClicked.id
      );
      if (foundNode) {
        if (foundNode.data.isExpanded) {
          foundNode.data.isExpanded = false;
          const expandedNodes = new Set(state.expandedNodes);
          expandedNodes.delete(foundNode.id);
          state.expandedNodes = Array.from(expandedNodes);

          const tempEdges = [...state.edges];
          const tempNodes = [...state.nodes];

          const edgesToDelete = tempEdges.filter(
            (edge) => edge.target === foundNode.id
          );
          tempNodes.filter((node) =>
            edgesToDelete.find((edge) => edge.source !== node.id)
          );
        } else {
          foundNode.data.isExpanded = true;
          const expandedNodes = new Set(state.expandedNodes);
          expandedNodes.add(foundNode.id);
          state.expandedNodes = Array.from(expandedNodes);
        }
      }
      state.flowViewStatus = 'node_expansion';
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
  handleNodeMouseDoubleClick,
  setFlowViewToPostAdd,
} = flowSlice.actions;
export const selectCurrentAccountingPeriod = (state: any) =>
  state.flow.currentChosenAccountingPeriod;
export const selectFlowNodes = (state: any) => state.flow.nodes;
export const selectFlowEdges = (state: any) => state.flow.edges;
export const selectNodeStyle = (state: any, nodeId: string) =>
  state.flow.nodeStyles[nodeId];
export const selectFlowViewStatus = (state: any) => state.flow.flowViewStatus;
export const selectLatestExpandedNodeId = (state: any) => {
  return state.flow.expandedNodes === undefined ||
    state.flow.expandedNodes.length === 0
    ? undefined
    : state.flow.expandedNodes[state.flow.expandedNodes.length - 1];
};

export default flowSlice.reducer;
