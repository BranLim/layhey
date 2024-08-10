import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import CashFlow from '@/types/CashFlow';
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
  StatementPeriod,
  SerializableStatementPeriod,
} from '@/types/StatementPeriod';
import { Draft } from 'immer';
import SerializableIncomeSummary = CashFlow.SerializableIncomeSummary;
import SerializableExpenseSummary = CashFlow.SerializableExpenseSummary;
import IncomeNodeData = Flow.IncomeNodeData;
import ExpenseNodeData = Flow.ExpenseNodeData;
import { detectAndResolveCollisions } from '@/lib/helpers/flow.helper';
import Flow from '@/types/Flow';

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

export type RenderCashFlowPayload = {
  cashFlowSummaries: (
    | CashFlow.SerializableCashFlowSummary
    | CashFlow.SerializableIncomeSummary
    | CashFlow.SerializableExpenseSummary
  )[];
  fromTargetNodeId: string;
};

export type FlowViewStatus =
  | 'initial_node_load'
  | 'initial_node_load_complete'
  | 'post_add_transaction'
  | 'node_expansion'
  | 'node_expansion_processing'
  | 'node_expansion_completed';

export type FlowViewState = {
  currentChosenAccountingPeriod: SerializableStatementPeriod;
  expandedNodes: Array<string>;
  nodes: Node<Flow.FlowNodeData>[];
  edges: Edge[];
  selectedNode?: Node<Flow.FlowNodeData>;
  nodeStyles: Record<string, any>;
  flowViewStatus: FlowViewStatus;
};

export type NodePosition = {
  x: number;
  y: number;
};

const initialState: FlowViewState = {
  currentChosenAccountingPeriod: {
    startPeriod: '',
    endPeriod: '',
  },
  expandedNodes: Array<string>(),
  nodes: Array<Node<Flow.FlowNodeData>>(),
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
  cashFlowSummaries: CashFlow.SerializableCashFlowSummary[]
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
  cashFlowSummaries: (
    | CashFlow.SerializableCashFlowSummary
    | CashFlow.SerializableIncomeSummary
    | CashFlow.SerializableExpenseSummary
  )[],
  xInitialPos: number,
  yInitialPos: number,
  height: number,
  width: number
): Node<Flow.FlowNodeData>[] => {
  const cashFlowNodes: Node<Flow.FlowNodeData>[] = [];
  let y = yInitialPos;
  if (cashFlowSummaries && cashFlowSummaries.length === 0) {
    const node: Node = {
      id: `node-${uuidv4()}`,
      type: 'noDataNode',
      position: { x: xInitialPos, y: y },
      height: height,
      width: width,
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      draggable: true,
      focusable: true,
      data: {},
    };
    cashFlowNodes.push(node);
    return cashFlowNodes;
  }

  for (const cashFlowSummary of cashFlowSummaries) {
    if (cashFlowSummary.statementType === 'Summary') {
      const node: Node<Flow.CashFlowNodeData> = {
        id: `node-${uuidv4()}`,
        type: 'cashFlowNode',
        position: { x: xInitialPos, y: y },
        height: height,
        width: width,
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
          isToolbarVisible: false,
        },
      };
      cashFlowNodes.push(node);
      applyDefaultNodeStyle(state, node.id);
    } else if (cashFlowSummary.statementType === 'Income') {
      const incomeStatement = cashFlowSummary as SerializableIncomeSummary;
      const node: Node<Flow.IncomeNodeData> = {
        id: `node-${uuidv4()}`,
        type: 'incomeExpenseNode',
        position: { x: xInitialPos, y: y },
        height: height,
        width: width,
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        draggable: true,
        focusable: true,
        data: {
          id: incomeStatement.id,
          parentRef: incomeStatement.parentRef,
          statementType: incomeStatement.statementType,
          startPeriod: incomeStatement.startPeriod,
          endPeriod: incomeStatement.endPeriod,
          total: incomeStatement.total,
          isToolbarVisible: false,
        },
      };
      cashFlowNodes.push(node);
      applyDefaultNodeStyle(state, node.id);
    } else if (cashFlowSummary.statementType === 'Expense') {
      const expenseStatement = cashFlowSummary as SerializableExpenseSummary;
      const node: Node<Flow.ExpenseNodeData> = {
        id: `node-${uuidv4()}`,
        type: 'incomeExpenseNode',
        position: { x: xInitialPos, y: y },
        height: height,
        width: width,
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        draggable: true,
        focusable: true,
        data: {
          id: expenseStatement.id,
          parentRef: expenseStatement.parentRef,
          statementType: expenseStatement.statementType,
          startPeriod: expenseStatement.startPeriod,
          endPeriod: expenseStatement.endPeriod,
          total: expenseStatement.total,
          isToolbarVisible: false,
        },
      };
      cashFlowNodes.push(node);
      applyDefaultNodeStyle(state, node.id);
    }
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

const getNodePosition = (
  nodes: Node<Flow.FlowNodeData>[],
  summary:
    | CashFlow.SerializableCashFlowSummary
    | CashFlow.SerializableIncomeSummary
    | CashFlow.SerializableExpenseSummary,
  targetNode: Node<Flow.FlowNodeData>
): NodePosition => {
  const childNodes = nodes.filter(
    (node) => node.data && node.data.parentRef === summary.parentRef
  );
  const lastChild = childNodes[childNodes.length - 1];

  const nodeXPosition = (targetNode?.position.x ?? 0) + 480;
  const nodeYPosition =
    (childNodes.length === 0 ? (targetNode?.position?.y ?? 0) : 0) +
    (lastChild ? lastChild.position.y + (lastChild.height ?? 0) : 0) +
    10;

  return { x: nodeXPosition, y: nodeYPosition };
};

const getChildNodes = (
  nodes: Node<Flow.FlowNodeData>[],
  target: Node<Flow.FlowNodeData>
): Set<string> => {
  const descendents = new Set<string>();
  const stack = [target];

  while (stack.length > 0) {
    const currentNode = stack.pop();
    nodes.forEach((node) => {
      if (node.data!.parentRef === currentNode!.data!.id) {
        descendents.add(node.id);
        stack.push(node);
      }
    });
  }
  return descendents;
};

const flowSlice = createSlice({
  name: 'flow',
  initialState: initialState,
  reducers: {
    setCurrentAccountingPeriod: (
      state: Draft<FlowViewState>,
      action: PayloadAction<SerializableStatementPeriod>
    ) => {
      const accountingPeriod = action.payload;
      if (accountingPeriod) {
        state.currentChosenAccountingPeriod = accountingPeriod;
      }
    },
    setOverallCashFlowNode: (
      state: Draft<FlowViewState>,
      action: PayloadAction<CashFlow.SerializableCashFlowSummary>
    ) => {
      const overallCashFlowSummary: CashFlow.SerializableCashFlowSummary =
        action.payload;

      const cashFlowNodes: Node<Flow.FlowNodeData>[] = [...state.nodes];

      let rootNode: Node<Flow.FlowNodeData> = cashFlowNodes[0];
      if (rootNode) {
        cashFlowNodes[0] = {
          ...rootNode,
          data: {
            ...rootNode.data,
            id: overallCashFlowSummary.id,
            parentRef: overallCashFlowSummary.parentRef,
            statementType: overallCashFlowSummary.statementType,
            startPeriod: overallCashFlowSummary.startPeriod,
            endPeriod: overallCashFlowSummary.endPeriod,
            inflow: overallCashFlowSummary.inflow,
            outflow: overallCashFlowSummary.outflow,
            difference: overallCashFlowSummary.difference,
          } as Flow.CashFlowNodeData,
        };
      } else {
        rootNode = {
          id: uuidv4(),
          type: 'cashFlowNode',
          position: { x: 0, y: 10 },
          width: 390,
          height: 180,
          sourcePosition: Position.Right,
          targetPosition: Position.Left,
          draggable: true,
          focusable: true,
          data: {
            id: overallCashFlowSummary.id,
            parentRef: overallCashFlowSummary.parentRef,
            statementType: overallCashFlowSummary.statementType,
            startPeriod: overallCashFlowSummary.startPeriod,
            endPeriod: overallCashFlowSummary.endPeriod,
            inflow: overallCashFlowSummary.inflow,
            outflow: overallCashFlowSummary.outflow,
            difference: overallCashFlowSummary.difference,
            currency: 'SGD',
            rootNode: true,
            isToolbarVisible: false,
          },
        };
        applyDefaultNodeStyle(state, rootNode.id);
        cashFlowNodes.push(rootNode);
      }

      state.nodes = cashFlowNodes;
    },
    renderCashFlowNodes: (
      state: Draft<FlowViewState>,
      action: PayloadAction<RenderCashFlowPayload>
    ) => {
      console.log('RenderCashFlowNodes');
      const { cashFlowSummaries, fromTargetNodeId } = action.payload;

      let nodes: Node<Flow.FlowNodeData>[] = [...state.nodes];
      let edges: Edge[] = [...state.edges];

      const targetNode = nodes.find((node) => node.id === fromTargetNodeId);
      if (!targetNode) {
        return;
      }
      const hasSummaryStatementsOnly =
        cashFlowSummaries.length > 1 &&
        cashFlowSummaries.every(
          (summary) => summary.statementType === 'Summary'
        );
      const sortedCashFlowSummaries = hasSummaryStatementsOnly
        ? sortCashFlowSummaries(
            cashFlowSummaries as CashFlow.SerializableCashFlowSummary[]
          )
        : cashFlowSummaries;

      sortedCashFlowSummaries.forEach((summary) => {
        console.log(`Rendering CashFlow Node for ${JSON.stringify(summary)}`);

        nodes = [...state.nodes];
        edges = [...state.edges];

        const nodeIndex = nodes.findIndex(
          (node) => node.data && node.data.id === summary.id
        );
        if (nodeIndex === -1) {
          const nodePosition = getNodePosition(nodes, summary, targetNode);
          const nodeHeight = summary.statementType === 'Summary' ? 180 : 124;
          const nodeWidth = 390;

          const generatedCashFlowNodes = generateCashFlowNodes(
            state,
            [summary],
            nodePosition.x,
            nodePosition.y,
            nodeHeight,
            nodeWidth
          );
          generatedCashFlowNodes.forEach((node) => {
            const updatedNode = detectAndResolveCollisions(node, nodes);
            node.position = updatedNode.position;
          });
          const generatedEdges = generateNodeEdges(
            fromTargetNodeId,
            generatedCashFlowNodes.map((node) => node.id)
          );

          nodes.push(...generatedCashFlowNodes);
          edges.push(...generatedEdges);

          state.nodes = nodes;
          state.edges = edges;

          return;
        }
        if (nodes[nodeIndex] && summary.statementType === 'Summary') {
          nodes[nodeIndex] = {
            ...nodes[nodeIndex],
            data: {
              id: summary.id,
              parentRef: summary.parentRef,
              statementType: summary.statementType,
              startPeriod: summary.startPeriod,
              endPeriod: summary.endPeriod,
              inflow: summary.inflow,
              outflow: summary.outflow,
              difference: summary.difference,
              currency: summary.currency,
              isToolbarVisible: false,
            },
          };
        } else if (nodes[nodeIndex] && summary.statementType === 'Income') {
          const incomeSummary = summary as SerializableIncomeSummary;
          nodes[nodeIndex] = {
            ...nodes[nodeIndex],
            data: {
              id: incomeSummary.id,
              parentRef: incomeSummary.parentRef,
              statementType: incomeSummary.statementType,
              startPeriod: incomeSummary.startPeriod,
              endPeriod: incomeSummary.endPeriod,
              total: incomeSummary.total,
            },
          } as Node<IncomeNodeData>;
        } else if (nodes[nodeIndex] && summary.statementType === 'Expense') {
          const expenseSummary = summary as SerializableExpenseSummary;
          nodes[nodeIndex] = {
            ...nodes[nodeIndex],
            data: {
              id: expenseSummary.id,
              parentRef: expenseSummary.parentRef,
              statementType: expenseSummary.statementType,
              startPeriod: expenseSummary.startPeriod,
              endPeriod: expenseSummary.endPeriod,
              total: expenseSummary.total,
            },
          } as Node<ExpenseNodeData>;
        }

        state.nodes = nodes;
        state.edges = edges;
      });
    },
    resetNodes: (
      state: Draft<FlowViewState>,
      action: PayloadAction<boolean>
    ) => {
      if (action.payload) {
        state.nodes = [state.nodes[0]];
        state.edges = [];
      }
    },
    updateNodeSize: (
      state: Draft<FlowViewState>,
      action: PayloadAction<CashFlow.UpdateNodeSize>
    ) => {
      const { id, width, height } = action.payload;
      const foundNode = state.nodes.find((node) => node.id === id);
      if (foundNode) {
        foundNode.width = width;
        foundNode.height = height;
      }
    },
    handleNodeMouseEnter: (
      state: Draft<FlowViewState>,
      action: PayloadAction<Node<Flow.FlowNodeData>>
    ) => {
      const mouseEnteredNode = action.payload;
      if (
        state.selectedNode &&
        mouseEnteredNode.id === state.selectedNode?.id
      ) {
        return;
      }

      const foundNodeStyle = state.nodeStyles[mouseEnteredNode.id];
      if (foundNodeStyle) {
        foundNodeStyle['border'] = '4px solid dimgray';
        foundNodeStyle['boxShadow'] = '0px 0px 16px lightslategray';
      }
    },
    handleNodeMouseLeave: (
      state: Draft<FlowViewState>,
      action: PayloadAction<Node<Flow.FlowNodeData>>
    ) => {
      const mouseLeaveNode = action.payload;
      if (state.selectedNode && mouseLeaveNode.id === state.selectedNode?.id) {
        return;
      }
      const foundNodeStyle = state.nodeStyles[mouseLeaveNode.id];

      if (foundNodeStyle) {
        foundNodeStyle['border'] = '3px solid black';
        foundNodeStyle['boxShadow'] = '0px 0px 12px darkslategray';
      }
    },
    handleNodeSelection: (
      state: Draft<FlowViewState>,
      action: PayloadAction<NodeSelectionChange>
    ) => {
      const changeEvent = action.payload;
      const foundNode = state.nodes.find(
        (node) => node && node.id === changeEvent.id
      );
      console.log('Handle Node Selection');
      if (!foundNode) {
        return;
      }
      foundNode.selected = changeEvent.selected;
      const foundNodeStyle = state.nodeStyles[foundNode.id];

      if (foundNode.data) {
        if (changeEvent.selected) {
          foundNode.data.isToolbarVisible = true;

          if (foundNodeStyle) {
            foundNodeStyle['border'] = '4px solid dimgray';
            foundNodeStyle['boxShadow'] = '0px 0px 16px lightslategray';
          }
          state.selectedNode = foundNode;
        } else {
          foundNode.data.isToolbarVisible = false;

          if (foundNodeStyle) {
            foundNodeStyle['border'] = '3px solid black';
            foundNodeStyle['boxShadow'] = '0px 0px 12px darkslategray';
          }
        }
      }
    },
    handleNodeMove: (
      state: Draft<FlowViewState>,
      action: PayloadAction<NodePositionChange>
    ) => {
      const changeEvent = action.payload;
      const foundNode = state.nodes.find((node) => node.id === changeEvent.id);
      if (foundNode && changeEvent.position) {
        foundNode.position = changeEvent.position;

        const resolved = detectAndResolveCollisions(foundNode, state.nodes);
        foundNode.position = resolved.position;
      }
    },
    handleNodeMouseClick: (
      state: Draft<FlowViewState>,
      action: PayloadAction<Node<Flow.FlowNodeData>>
    ) => {
      const nodeDoubleClicked = action.payload;
      const foundNode = state.nodes.find(
        (node) => node.id === nodeDoubleClicked.id
      );
      if (!foundNode || !foundNode.data) {
        return;
      }
      foundNode.selectable = true;
      foundNode.selected = true;
    },
    handleNodeMouseDoubleClick: (
      state: Draft<FlowViewState>,
      action: PayloadAction<Node<Flow.FlowNodeData>>
    ) => {
      const nodeDoubleClicked = action.payload;
      const foundNode = state.nodes.find(
        (node) => node.id === nodeDoubleClicked.id
      );
      if (!foundNode || !foundNode.data) {
        return;
      }
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

      state.flowViewStatus = 'node_expansion';
    },
    handleNodeHide: (
      state: Draft<FlowViewState>,
      action: PayloadAction<string>
    ) => {
      const nodeId = action.payload;
      const foundNode = state.nodes.find((node) => node.id === nodeId);
      if (foundNode) {
        console.log(`Found Node ${nodeId} to hide`);
        const childNodeIdsToDrop = getChildNodes([...state.nodes], foundNode);
        const nodesToKeep = state.nodes
          .filter((node) => !childNodeIdsToDrop.has(node.id))
          .filter((node) => node.id !== nodeId);
        console.log(state.edges.length);
        const edgesToKeep = state.edges
          .filter((edge) => !childNodeIdsToDrop.has(edge.source))
          .filter((edge) => edge.source !== nodeId);
        console.log(edgesToKeep.length);

        state.nodes = nodesToKeep;
        state.edges = edgesToKeep;
      }
    },
  },
});

export const {
  setCurrentAccountingPeriod,
  setOverallCashFlowNode,
  renderCashFlowNodes,
  resetNodes,
  updateNodeSize,
  handleNodeSelection,
  handleNodeMove,
  handleNodeMouseEnter,
  handleNodeMouseLeave,
  handleNodeMouseClick,
  handleNodeMouseDoubleClick,
  handleNodeHide,
} = flowSlice.actions;
export const selectFlowNodes = (state: any) => state.flow.nodes;
export const selectFlowEdges = (state: any) => state.flow.edges;
export const selectRootNode = (state: any) => state.flow.nodes[0];
export const selectNodeStyle = (state: any, nodeId: string) =>
  state.flow.nodeStyles[nodeId];
export const selectPeriodForSelectedNode = createSelector(
  (state: any) => state.flow.selectedNode,
  (selectedNode) => {
    const accountingPeriod: SerializableStatementPeriod = {
      startPeriod: '',
      endPeriod: '',
    };
    if (selectedNode) {
      accountingPeriod.startPeriod = selectedNode.data.startPeriod;
      accountingPeriod.endPeriod = selectedNode.data.endPeriod;
    }
    return accountingPeriod;
  }
);
export default flowSlice.reducer;
