import React, { useEffect, useMemo } from 'react';
import ReactFlow, {
  Background,
  BackgroundVariant,
  NodeChange,
  Node,
  useReactFlow,
} from 'reactflow';
import { useAppDispatch, useAppSelector } from '@/states/hooks';
import {
  selectAccountingPeriod,
  selectAllCashFlowSummaryByMonthWithinAccountingPeriod,
  selectCashFlowSummary,
} from '@/states/features/cashflow/cashflow-slice';
import { CashFlowNode } from '@/components/cashflow/CashFlowNode';
import { selectIsOpenModal } from '@/states/common/modal-slice';
import 'reactflow/dist/style.css';
import {
  FlowPayload,
  handleNodeMouseEnter,
  handleNodeMouseLeave,
  handleNodeMove,
  handleNodeSelection,
  selectDefaultViewPort,
  selectFlowEdges,
  selectFlowNodes,
  setCashFlows,
} from '@/states/features/cashflow/flow-slice';

const nodeDragThreshold = 6;
const defaultViewPort = { x: 10, y: 20, zoom: 0.8 };

export const CashFlowView = () => {
  const dispatch = useAppDispatch();
  const nodeTypes = useMemo(() => ({ cashFlowNode: CashFlowNode }), []);
  const modalClose = useAppSelector(selectIsOpenModal);
  const cashFlowAccountingPeriod = useAppSelector(selectAccountingPeriod);
  const cashFlowSummary = useAppSelector(selectCashFlowSummary);
  const allCashFlowsForPeriod = useAppSelector(
    selectAllCashFlowSummaryByMonthWithinAccountingPeriod
  );
  const nodes = useAppSelector(selectFlowNodes);
  const edges = useAppSelector(selectFlowEdges);
  const viewport = useAppSelector(selectDefaultViewPort);

  useEffect(() => {
    if (
      !cashFlowAccountingPeriod.startPeriod &&
      !cashFlowAccountingPeriod.endPeriod
    ) {
      return;
    }
    console.log(`Updating Budget Summary: ${JSON.stringify(cashFlowSummary)}`);
    const payload: FlowPayload = {
      rootCashFlowSummary: {
        ...cashFlowSummary,
        startPeriod: cashFlowSummary.startPeriod?.toISOString() ?? '',
        endPeriod: cashFlowSummary.endPeriod?.toISOString() ?? '',
      },
      cashFlowSummaries: allCashFlowsForPeriod.map((cashFlowForPeriod) => ({
        ...cashFlowForPeriod,
        startPeriod: cashFlowForPeriod.startPeriod?.toISOString() ?? '',
        endPeriod: cashFlowForPeriod.endPeriod?.toISOString() ?? '',
      })),
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

  const handleMouseLeave = (event: React.MouseEvent, node: Node) => {
    dispatch(handleNodeMouseLeave(node));
  };

  const handleMouseEnter = (event: React.MouseEvent, node: Node) => {
    dispatch(handleNodeMouseEnter(node));
  };

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      proOptions={{ hideAttribution: true }}
      onNodesChange={handleNodesChange}
      onNodeMouseEnter={handleMouseEnter}
      onNodeMouseLeave={handleMouseLeave}
      nodeDragThreshold={nodeDragThreshold}
      minZoom={0.1}
      maxZoom={5.0}
      defaultViewport={defaultViewPort}
    >
      <Background
        color='snow'
        variant={BackgroundVariant.Dots}
        size={1}
        style={{ background: 'slategrey' }}
      />
    </ReactFlow>
  );
};
