import React, { useEffect, useMemo } from 'react';
import ReactFlow, {
  Background,
  BackgroundVariant,
  Node,
  Position,
  useNodesState,
} from 'reactflow';
import { useAppSelector } from '@/lib/hooks';
import {
  selectAccountingPeriod,
  selectCashFlowSummary,
} from '@/slices/cashflow-slice';
import {
  CashFlowSummaryNode,
  CashFlowNodeProps,
} from '@/components/budget/CashFlowSummaryNode';
import { selectIsOpenModal } from '@/slices/modal-slice';
import 'reactflow/dist/style.css';

const initialNodes: Node<CashFlowNodeProps>[] = [
  {
    id: 'node-1',
    type: 'budgetNode',
    position: { x: 0, y: 0 },
    sourcePosition: Position.Top,
    targetPosition: Position.Bottom,
    draggable: true,
    focusable: true,
    data: {
      startPeriod: undefined,
      endPeriod: undefined,
      inflow: 0,
      outflow: 0,
      difference: 0,
      currency: 'SGD',
    },
  },
];

export const CashFlowView = () => {
  const modalClose = useAppSelector(selectIsOpenModal);
  const budgetPeriod = useAppSelector(selectAccountingPeriod);
  const budgetSummary = useAppSelector(selectCashFlowSummary);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const nodeTypes = useMemo(() => ({ budgetNode: CashFlowSummaryNode }), []);
  useEffect(() => {
    if (!budgetPeriod.startPeriod && !budgetPeriod.endPeriod) {
      return;
    }
    console.log(`Updating Budget Summary: ${JSON.stringify(budgetSummary)}`);
    const firstNode = nodes[0];
    const updatedNode: Node<CashFlowNodeProps> = {
      ...firstNode,
      data: {
        rootNode: true,
        startPeriod: budgetSummary.startPeriod,
        endPeriod: budgetSummary.endPeriod,
        inflow: budgetSummary.inflow,
        outflow: budgetSummary.outflow,
        difference: budgetSummary.difference,
        currency: 'SGD',
      },
    };
    setNodes([updatedNode]);
  }, [
    modalClose,
    budgetSummary.startPeriod,
    budgetSummary.endPeriod,
    budgetSummary.inflow,
    budgetSummary.outflow,
    budgetSummary.difference,
  ]);

  return (
    <ReactFlow
      nodes={nodes}
      nodeTypes={nodeTypes}
      fitView={true}
      proOptions={{ hideAttribution: true }}
      onNodesChange={onNodesChange}
      minZoom={0.3}
      maxZoom={1.2}
    >
      <Background
        color='lightgray'
        variant={BackgroundVariant.Dots}
        size={1}
        style={{ background: 'lightslategrey' }}
      />
    </ReactFlow>
  );
};
