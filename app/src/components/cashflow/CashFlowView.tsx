import React, { useEffect, useMemo } from 'react';
import ReactFlow, {
  Background,
  BackgroundVariant,
  useNodesState,
  Node,
} from 'reactflow';
import { useAppDispatch, useAppSelector } from '@/states/hooks';
import {
  selectAccountingPeriod,
  selectAllCashFlowSummaryByMonthWithinAccountingPeriod,
  selectCashFlowSummary,
} from '@/states/features/cashflow/cashflow-slice';
import { CashFlowSummaryNode } from '@/components/cashflow/CashFlowSummaryNode';
import { selectIsOpenModal } from '@/states/common/modal-slice';
import 'reactflow/dist/style.css';
import {
  FlowPayload,
  selectFlowEdges,
  selectFlowNodes,
  selectOnNodesChange,
  setCashFlows,
} from '@/states/features/cashflow/flow-slice';
import { CashFlowNodeData } from '@/types/CashFlow';

const initialNodes: Node<CashFlowNodeData>[] = [];

export const CashFlowView = () => {
  const dispatch = useAppDispatch();
  const nodeTypes = useMemo(() => ({ budgetNode: CashFlowSummaryNode }), []);
  const modalClose = useAppSelector(selectIsOpenModal);
  const cashFlowAccountingPeriod = useAppSelector(selectAccountingPeriod);
  const cashFlowSummary = useAppSelector(selectCashFlowSummary);
  const allCashFlowsForPeriod = useAppSelector(
    selectAllCashFlowSummaryByMonthWithinAccountingPeriod
  );
  const nodes = useAppSelector(selectFlowNodes);
  const edges = useAppSelector(selectFlowEdges);

  useEffect(() => {
    if (
      !cashFlowAccountingPeriod.startPeriod &&
      !cashFlowAccountingPeriod.endPeriod
    ) {
      return;
    }
    console.log(`Updating Budget Summary: ${JSON.stringify(cashFlowSummary)}`);
    const payload: FlowPayload = {
      rootCashFlowSummary: cashFlowSummary,
      cashFlowSummaries: allCashFlowsForPeriod,
    };
    dispatch(setCashFlows(payload));
  }, [
    modalClose,
    cashFlowSummary.startPeriod,
    cashFlowSummary.endPeriod,
    cashFlowSummary.inflow,
    cashFlowSummary.outflow,
    cashFlowSummary.difference,
  ]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      fitView={false}
      proOptions={{ hideAttribution: true }}
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
