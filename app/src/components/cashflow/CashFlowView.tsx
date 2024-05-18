import React, { useEffect, useMemo } from 'react';
import ReactFlow, {
  Background,
  BackgroundVariant,
  NodeChange,
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
  handleNodeMove,
  handleNodeSelection,
  selectFlowEdges,
  selectFlowNodes,
  setCashFlows,
} from '@/states/features/cashflow/flow-slice';

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

  const handleNodesChange = (changes: NodeChange[]) => {
    changes.forEach((change) => {
      switch (change.type) {
        case 'select':
          dispatch(handleNodeSelection(change));
          break;
        case 'position':
          dispatch(handleNodeMove(change));
          break;
      }
    });
  };

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      fitView={false}
      proOptions={{ hideAttribution: true }}
      onNodesChange={handleNodesChange}
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
