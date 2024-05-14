import React, { useEffect } from 'react';
import ReactFlow, {
  Background,
  BackgroundVariant,
  Node,
  Position,
  useNodesState,
} from 'reactflow';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import {
  getTransactions,
  selectBudgetPeriod,
  selectBudgetSummary,
  setBudgetPeriod,
} from '@/slices/transaction-slice';
import { BudgetNode, BudgetNodeProps } from '@/components/budget/BudgetNode';
import { selectIsOpenModal } from '@/slices/modal-slice';
import { BudgetSummary } from '@/types/Budget';
import 'reactflow/dist/style.css';

const nodeTypes = { budgetNode: BudgetNode };
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
      startPeriod: '',
      endPeriod: '',
      inflow: 0,
      outflow: 0,
      difference: 0,
    },
  },
];

export const BudgetView = () => {
  const dispatch = useAppDispatch();
  const modalClose = useAppSelector(selectIsOpenModal);
  const budgetPeriod = useAppSelector(selectBudgetPeriod);
  const budgetSummary = useAppSelector(selectBudgetSummary);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);

  useEffect(() => {
    if (!budgetPeriod.startPeriod && !budgetPeriod.endPeriod) {
      console.log('Setting budget period');
      dispatch(
        setBudgetPeriod({ startPeriod: '2024-01-01', endPeriod: '2024-12-31' })
      );
      return;
    }
    console.log(`Updating Budget Period: ${JSON.stringify(budgetSummary)}`);
    dispatch(
      getTransactions({
        startPeriod: budgetPeriod.startPeriod,
        endPeriod: budgetPeriod.endPeriod,
      })
    );
  }, [budgetPeriod.startPeriod, budgetPeriod.endPeriod]);

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
        size={2}
        style={{ background: 'lightslategrey' }}
      />
    </ReactFlow>
  );
};
