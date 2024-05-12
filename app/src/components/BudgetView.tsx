import ReactFlow, {
  applyNodeChanges,
  Background,
  BackgroundVariant,
  Position,
} from 'reactflow';
import { useAppSelector } from '@/lib/hooks';
import {
  selectBudgetPeriod,
  selectBudgetSummary,
} from '@/slices/transaction-slice';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { BudgetNode } from '@/components/budget/BudgetNode';
import { selectIsOpenModal } from '@/slices/modal-slice';

const initialNodes = [
  {
    id: 'node-1',
    type: 'budgetNode',
    position: { x: 0, y: 0 },
    sourcePosition: Position.Top,
    targetPosition: Position.Bottom,
    draggable: true,
    data: {
      inflow: 0,
      outflow: 0,
      difference: 0,
    },
  },
];

export const BudgetView = () => {
  const nodeTypes = useMemo(() => ({ budgetNode: BudgetNode }), []);
  const modalClose = useAppSelector(selectIsOpenModal);
  const budgetPeriod = useAppSelector(selectBudgetPeriod);
  const budgetSummary = useAppSelector(selectBudgetSummary);
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState([]);

  useEffect(() => {
    if (!budgetPeriod.startPeriod && !budgetPeriod.endPeriod) {
      return;
    }
    console.log(`Updating Budget Summary: ${JSON.stringify(budgetSummary)}`);
    const firstNode = nodes[0];
    const updatedNode = {
      ...firstNode,
      data: {
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
      edges={edges}
      nodeTypes={nodeTypes}
      fitView={true}
      proOptions={{ hideAttribution: true }}
    >
      <Background color='lightgray' variant={BackgroundVariant.Dots} />
    </ReactFlow>
  );
};
