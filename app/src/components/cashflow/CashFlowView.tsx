import React, { useEffect, useMemo } from 'react';
import ReactFlow, {
  Background,
  BackgroundVariant,
  Node,
  NodeChange,
} from 'reactflow';
import { useAppDispatch, useAppSelector } from '@/states/hooks';
import {
  getCashFlows,
  selectCashFlowStoreStatus,
  selectIsInitialLoadCompleted,
  selectOverallCashFlowSummary,
  setInitialLoadCompleted,
} from '@/states/features/cashflow/cashflow.slice';
import { CashFlowNode } from '@/components/cashflow/CashFlowNode';
import 'reactflow/dist/style.css';
import {
  handleNodeMouseDoubleClick,
  handleNodeMouseEnter,
  handleNodeMouseLeave,
  handleNodeMove,
  handleNodeSelection,
  selectFlowEdges,
  selectFlowNodes,
  selectFlowViewStatus,
} from '@/states/features/cashflow/flow.slice';
import { Loading } from '@/components/common/Loading';
import CashFlow from '@/types/CashFlow';

const nodeDragThreshold = 6;
export const defaultViewPort = { x: 10, y: 20, zoom: 0.8 };

export const CashFlowView = () => {
  const dispatch = useAppDispatch();
  const nodeTypes = useMemo(() => ({ cashFlowNode: CashFlowNode }), []);
  const cashFlowStoreStateStatus = useAppSelector(selectCashFlowStoreStatus);
  const initialLoadCompleted = useAppSelector(selectIsInitialLoadCompleted);
  const overallCashFlowSummary = useAppSelector(selectOverallCashFlowSummary);
  const nodes = useAppSelector(selectFlowNodes);
  const edges = useAppSelector(selectFlowEdges);

  useEffect(() => {
    if (
      !initialLoadCompleted &&
      cashFlowStoreStateStatus === 'completed_get_overall_cashflow'
    ) {
      console.log(
        `CashFlowView: Load cashflows. Current Store Status: ${cashFlowStoreStateStatus}`
      );
      dispatch(
        getCashFlows({
          startPeriod: overallCashFlowSummary.startPeriod?.toISOString() ?? '',
          endPeriod: overallCashFlowSummary.endPeriod?.toISOString() ?? '',
          append: true,
          parentStatementSlotId: overallCashFlowSummary.id,
          parentNodeId: nodes[0].id,
        })
      );
      dispatch(setInitialLoadCompleted());
    }
  }, [dispatch, cashFlowStoreStateStatus, initialLoadCompleted]);

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

  const handleMouseLeave = (
    event: React.MouseEvent,
    node: Node<CashFlow.CashFlowNodeData>
  ) => {
    dispatch(handleNodeMouseLeave(node));
  };

  const handleMouseEnter = (
    event: React.MouseEvent,
    node: Node<CashFlow.CashFlowNodeData>
  ) => {
    dispatch(handleNodeMouseEnter(node));
  };

  const handleMouseDoubleClick = async (
    event: React.MouseEvent,
    node: Node<CashFlow.CashFlowNodeData>
  ) => {
    if (event.button === 0) {
      dispatch(handleNodeMouseDoubleClick(node));
      const { id, startPeriod, endPeriod } = node.data;
      await dispatch(
        getCashFlows({
          startPeriod,
          endPeriod,
          append: true,
          parentNodeId: node.id,
          parentStatementSlotId: id,
        })
      );
    }
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
        onNodeDoubleClick={handleMouseDoubleClick}
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
