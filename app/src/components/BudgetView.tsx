import ReactFlow, { Background, BackgroundVariant } from 'reactflow';
import { useAppSelector } from '@/lib/hooks';
import {
  selectBudgetPeriod,
  selectBudgetSummary,
} from '@/slices/transaction-slice';
import { useEffect, useState } from 'react';
import { BudgetNode } from '@/components/budget/BudgetNode';
import { selectIsOpenModal } from '@/slices/modal-slice';

const initialNodes = [
  {
    id: 'node-1',
    type: 'budgetNode',
    position: { x: 0, y: 0 },
    data: {
      inflow: 0,
      outflow: 0,
      difference: 0,
    },
  },
];
const nodeTypes = { budgetNode: BudgetNode };
export const BudgetView = () => {
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
