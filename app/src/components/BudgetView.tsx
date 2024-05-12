import React, { useEffect } from 'react';
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
import { BudgetNode } from '@/components/budget/BudgetNode';
import { selectIsOpenModal } from '@/slices/modal-slice';
import { BudgetSummary } from '@/types/Budget';
import 'reactflow/dist/style.css';

const nodeTypes = { budgetNode: BudgetNode };
const initialNodes: Node<BudgetSummary>[] = [
  {
    id: 'node-1',
    type: 'budgetNode',
    position: { x: 0, y: 0 },
    sourcePosition: Position.Top,
    targetPosition: Position.Bottom,
    draggable: true,
    focusable: true,
    data: {
      startPeriod: '',
      endPeriod: '',
      inflow: 0,
      outflow: 0,
      difference: 0,
    },
  },
];

export const BudgetView = () => {
  const modalClose = useAppSelector(selectIsOpenModal);
  const budgetPeriod = useAppSelector(selectBudgetPeriod);
  const budgetSummary = useAppSelector(selectBudgetSummary);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);

  useEffect(() => {
    if (!budgetPeriod.startPeriod && !budgetPeriod.endPeriod) {
      return;
    }
    console.log(`Updating Budget Summary: ${JSON.stringify(budgetSummary)}`);
    const firstNode = nodes[0];
    const updatedNode: Node<BudgetSummary> = {
      ...firstNode,
      data: {
        startPeriod: budgetSummary.startPeriod,
        endPeriod: budgetSummary.endPeriod,
        inflow: budgetSummary.inflow,
        outflow: budgetSummary.outflow,
        difference: budgetSummary.difference,
      },
    };
    setNodes([updatedNode]);
  }, [
    modalClose,
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
      <Background color='lightgray' variant={BackgroundVariant.Dots} />
    </ReactFlow>
  );
};
