import { createSlice, PayloadAction } from '@reduxjs/toolkit';
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
import { SerializableAccountingPeriod } from '@/types/AccountingPeriod';
import { startAppListening } from '@/states/listeners';
import { fetchRelevantCashFlowDetails } from '@/states/features/cashflow/cashflow.listener';
import SerializableCashFlowSummary = CashFlow.SerializableCashFlowSummary;
import SerializableIncomeSummary = CashFlow.SerializableIncomeSummary;
import SerializableExpenseSummary = CashFlow.SerializableExpenseSummary;
import IncomeNodeData = CashFlow.IncomeNodeData;
import ExpenseNodeData = CashFlow.ExpenseNodeData;

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
  rootCashFlowSummary: CashFlow.SerializableCashFlowSummary;
  cashFlowSummaries: CashFlow.SerializableCashFlowSummary[];
};

export type AddCashFlowPayload = {
  cashFlowSummaries: (
    | CashFlow.SerializableCashFlowSummary
    | CashFlow.SerializableIncomeSummary
    | CashFlow.SerializableExpenseSummary
  )[];
  targetNodeId: string;
  updateMode: CashFlow.GraphUpdateMode;
};

type FlowNodeData =
  | CashFlow.CashFlowNodeData
  | CashFlow.IncomeNodeData
  | CashFlow.ExpenseNodeData
  | undefined;

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
  nodes: Node<FlowNodeData>[];
  edges: Edge[];
  selectedNode?: Node<FlowNodeData>;
  nodeStyles: Record<string, any>;
  flowViewStatus: FlowViewStatus;
};

const initialState: FlowViewState = {
  currentChosenAccountingPeriod: {
    startPeriod: '',
    endPeriod: '',
  },
  expandedNodes: Array<string>(),
  nodes: Array<Node<CashFlow.CashFlowNodeData>>(),
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
  yInitialPos: number
): Node<FlowNodeData>[] => {
  const cashFlowNodes: Node<FlowNodeData>[] = [];
  let y = yInitialPos;
  if (cashFlowSummaries && cashFlowSummaries.length === 0) {
    const node: Node = {
      id: `node-${uuidv4()}`,
      type: 'noDataNode',
      position: { x: xInitialPos, y: y },
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
      const node: Node<CashFlow.CashFlowNodeData> = {
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
    } else if (cashFlowSummary.statementType === 'Income') {
      const incomeStatement = cashFlowSummary as SerializableIncomeSummary;
      const node: Node<CashFlow.IncomeNodeData> = {
        id: `node-${uuidv4()}`,
        type: 'incomeExpenseNode',
        position: { x: xInitialPos, y: y },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        draggable: true,
        focusable: true,
        data: {
          id: incomeStatement.id,
          parentRef: incomeStatement.parentRef,
          statementType: incomeStatement.statementType,
          accountingPeriod: {
            startPeriod: incomeStatement.accountingPeriod.startPeriod,
            endPeriod: incomeStatement.accountingPeriod.endPeriod,
          },
          total: incomeStatement.total,
        },
      };
      cashFlowNodes.push(node);
      applyDefaultNodeStyle(state, node.id);
    } else if (cashFlowSummary.statementType === 'Expense') {
      const expenseStatement = cashFlowSummary as SerializableExpenseSummary;
      const node: Node<CashFlow.ExpenseNodeData> = {
        id: `node-${uuidv4()}`,
        type: 'incomeExpenseNode',
        position: { x: xInitialPos, y: y },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        draggable: true,
        focusable: true,
        data: {
          id: expenseStatement.id,
          parentRef: expenseStatement.parentRef,
          statementType: expenseStatement.statementType,
          accountingPeriod: {
            startPeriod: expenseStatement.accountingPeriod.startPeriod,
            endPeriod: expenseStatement.accountingPeriod.endPeriod,
          },
          total: expenseStatement.total,
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
      state.flowViewStatus = 'initial_node_load';
    },
    setOverallCashFlowNode: (
      state,
      action: PayloadAction<CashFlow.SerializableCashFlowSummary>
    ) => {
      const overallCashFlowSummary: CashFlow.SerializableCashFlowSummary =
        action.payload;

      const cashFlowNodes: Node<FlowNodeData>[] = [...state.nodes];

      let rootNode: Node<FlowNodeData> = cashFlowNodes[0];
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
          } as CashFlow.CashFlowNodeData,
        };
      } else {
        rootNode = {
          id: uuidv4(),
          type: 'cashFlowNode',
          position: { x: 0, y: 10 },
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
          },
        };
        applyDefaultNodeStyle(state, rootNode.id);
        cashFlowNodes.push(rootNode);
      }

      state.nodes = cashFlowNodes;
    },
    showCashFlows: (state, action: PayloadAction<AddCashFlowPayload>) => {
      try {
        console.log('Adding cashflow nodes');
        const { targetNodeId, cashFlowSummaries, updateMode } = action.payload;

        const nodes: Node<FlowNodeData>[] =
          updateMode === 'Append' || updateMode === 'InPlace'
            ? [...state.nodes]
            : [state.nodes[0]];
        const edges: Edge[] =
          updateMode === 'Append' || updateMode === 'InPlace'
            ? [...state.edges]
            : [];

        const targetNode = nodes.find((node) => node.id === targetNodeId);

        const summaryStatementsOnly = cashFlowSummaries.every(
          (summary) => summary.statementType === 'Summary'
        );
        const sortedCashFlowSummaries = summaryStatementsOnly
          ? sortCashFlowSummaries(
              cashFlowSummaries as SerializableCashFlowSummary[]
            )
          : cashFlowSummaries;

        if (updateMode === 'Append' || updateMode === 'Reset') {
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
        } else {
          cashFlowSummaries.forEach((cashFlowSummary) => {
            const nodeIndex = nodes.findIndex(
              (node) => node.data && node.data.id === cashFlowSummary.id
            );

            if (
              nodes[nodeIndex] &&
              cashFlowSummary.statementType === 'Summary'
            ) {
              nodes[nodeIndex] = {
                ...nodes[nodeIndex],
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
            } else if (
              nodes[nodeIndex] &&
              cashFlowSummary.statementType === 'Income'
            ) {
              const incomeSummary =
                cashFlowSummary as SerializableIncomeSummary;
              nodes[nodeIndex] = {
                ...nodes[nodeIndex],
                data: {
                  id: incomeSummary.id,
                  parentRef: incomeSummary.parentRef,
                  statementType: incomeSummary.statementType,
                  accountingPeriod: {
                    startPeriod: incomeSummary.accountingPeriod.startPeriod,
                    endPeriod: incomeSummary.accountingPeriod.endPeriod,
                  },
                  total: incomeSummary.total,
                },
              } as Node<IncomeNodeData>;
            } else if (
              nodes[nodeIndex] &&
              cashFlowSummary.statementType === 'Expense'
            ) {
              const expenseSummary =
                cashFlowSummary as SerializableExpenseSummary;
              nodes[nodeIndex] = {
                ...nodes[nodeIndex],
                data: {
                  id: expenseSummary.id,
                  parentRef: expenseSummary.parentRef,
                  statementType: expenseSummary.statementType,
                  accountingPeriod: {
                    startPeriod: expenseSummary.accountingPeriod.startPeriod,
                    endPeriod: expenseSummary.accountingPeriod.endPeriod,
                  },
                  total: expenseSummary.total,
                },
              } as Node<ExpenseNodeData>;
            }
          });
        }

        state.nodes = nodes;
        state.edges = edges;
      } catch (error) {
        console.log(error);
      }
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
      const foundNode = state.nodes.find(
        (node) => node && node.id === changeEvent.id
      );
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
  },
});

export const {
  setCurrentAccountingPeriod,
  setOverallCashFlowNode,
  showCashFlows,
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
export const selectRootNode = (state: any) => state.flow.nodes[0];
export const selectNodeStyle = (state: any, nodeId: string) =>
  state.flow.nodeStyles[nodeId];
export const selectFlowViewStatus = (state: any) => state.flow.flowViewStatus;
export const selectLatestExpandedNodeId = (state: any) => {
  return state.flow.expandedNodes === undefined ||
    state.flow.expandedNodes.length === 0
    ? undefined
    : state.flow.expandedNodes[state.flow.expandedNodes.length - 1];
};

startAppListening({
  actionCreator: handleNodeMouseDoubleClick,
  effect: fetchRelevantCashFlowDetails,
});

export default flowSlice.reducer;
