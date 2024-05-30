import React, { useEffect, useMemo } from 'react';
import ReactFlow, {
  Background,
  BackgroundVariant,
  Node,
  NodeChange,
} from 'reactflow';
import { useAppDispatch, useAppSelector } from '@/states/hooks';
import {
  selectAllCashFlowSummaryByMonthWithinAccountingPeriod,
  selectCashFlowSummary,
  selectCashFlowStoreStatus,
} from '@/states/features/cashflow/cashflow.slice';
import { CashFlowNode } from '@/components/cashflow/CashFlowNode';
import { selectIsOpenModal } from '@/states/common/modal.slice';
import 'reactflow/dist/style.css';
import {
  FlowPayload,
  handleNodeMouseEnter,
  handleNodeMouseLeave,
  handleNodeMove,
  handleNodeSelection,
  selectCurrentAccountingPeriod,
  selectFlowEdges,
  selectFlowNodes,
  setCashFlows,
} from '@/states/features/cashflow/flow.slice';
import { Loading } from '@/components/common/Loading';

const nodeDragThreshold = 6;
export const defaultViewPort = { x: 10, y: 20, zoom: 0.8 };

export const CashFlowView = () => {
  const dispatch = useAppDispatch();
  const nodeTypes = useMemo(() => ({ cashFlowNode: CashFlowNode }), []);
  const modalClose = useAppSelector(selectIsOpenModal);
  const cashFlowStoreStateStatus = useAppSelector(selectCashFlowStoreStatus);
  const cashFlowAccountingPeriod = useAppSelector(
    selectCurrentAccountingPeriod
  );
  const cashFlowSummary = useAppSelector(selectCashFlowSummary);
  const allCashFlowsForPeriod = useAppSelector(
    selectAllCashFlowSummaryByMonthWithinAccountingPeriod
  );
  const nodes = useAppSelector(selectFlowNodes);
  const edges = useAppSelector(selectFlowEdges);

  useEffect(() => {
    if (
      cashFlowStoreStateStatus !== 'compute_completed' &&
      cashFlowStoreStateStatus !== 'load_complete' &&
      !cashFlowSummary
    ) {
      return;
    }

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
  }, [dispatch, cashFlowStoreStateStatus]);

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
    <>
      {cashFlowStoreStateStatus === 'loading' && <Loading />}
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
    </>
  );
};
