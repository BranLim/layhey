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
  selectBudgetPeriod,
  selectBudgetSummary,
} from '@/slices/transaction-slice';
import { BudgetNode, BudgetNodeProps } from '@/components/budget/BudgetNode';
import { selectIsOpenModal } from '@/slices/modal-slice';
import 'reactflow/dist/style.css';

const initialNodes: Node<BudgetNodeProps>[] = [
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

export const BudgetView = () => {
  const modalClose = useAppSelector(selectIsOpenModal);
  const budgetPeriod = useAppSelector(selectBudgetPeriod);
  const budgetSummary = useAppSelector(selectBudgetSummary);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const nodeTypes = useMemo(() => ({ budgetNode: BudgetNode }), []);
  useEffect(() => {
    if (!budgetPeriod.startPeriod && !budgetPeriod.endPeriod) {
      return;
    }
    console.log(`Updating Budget Summary: ${JSON.stringify(budgetSummary)}`);
    const firstNode = nodes[0];
    const updatedNode: Node<BudgetNodeProps> = {
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
