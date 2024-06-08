import React, { useEffect, useMemo, useState } from 'react';
import ReactFlow, {
  Background,
  BackgroundVariant,
  Node,
  NodeChange,
} from 'reactflow';
import { useAppDispatch, useAppSelector } from '@/states/hooks';
import {
  getTransactions,
  selectCashFlowStoreStatus,
  selectOverallCashFlowSummary,
  selectCashFlowStatements,
  generateCashFlowSummaryGraph,
} from '@/states/features/cashflow/cashflow.slice';
import { CashFlowNode } from '@/components/cashflow/CashFlowNode';
import 'reactflow/dist/style.css';
import {
  FlowPayload,
  handleNodeMouseEnter,
  handleNodeMouseLeave,
  handleNodeMove,
  handleNodeSelection,
  handleNodeMouseDoubleClick,
  selectFlowEdges,
  selectFlowNodes,
  setInitialCashFlows,
  selectLatestExpandedNodeId,
  selectFlowViewStatus,
  addCashFlows,
  setOverallCashFlowNode,
} from '@/states/features/cashflow/flow.slice';
import { Loading } from '@/components/common/Loading';
import { CashFlowNodeData } from '@/types/CashFlow';

const nodeDragThreshold = 6;
export const defaultViewPort = { x: 10, y: 20, zoom: 0.8 };

export const CashFlowView = () => {
  const dispatch = useAppDispatch();
  const nodeTypes = useMemo(() => ({ cashFlowNode: CashFlowNode }), []);
  const cashFlowStoreStateStatus = useAppSelector(selectCashFlowStoreStatus);
  const flowViewStatus = useAppSelector(selectFlowViewStatus);
  const overallCashFlowSummary = useAppSelector(selectOverallCashFlowSummary);
  const [selectedParentStatementId, setSelectedParentStatementId] =
    useState<string>(overallCashFlowSummary.id);
  const latestExpandedNodeId = useAppSelector(selectLatestExpandedNodeId);
  const cashFlowStatements = useAppSelector((state) =>
    selectCashFlowStatements(state, selectedParentStatementId)
  );
  const nodes = useAppSelector(selectFlowNodes);
  const edges = useAppSelector(selectFlowEdges);

  useEffect(() => {
    if (
      flowViewStatus === 'post_add_transaction' &&
      cashFlowStoreStateStatus === 'post_add_transaction_completed'
    ) {
      setSelectedParentStatementId(overallCashFlowSummary.id);
    }
  }, [flowViewStatus, cashFlowStoreStateStatus]);

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
    node: Node<CashFlowNodeData>
  ) => {
    dispatch(handleNodeMouseLeave(node));
  };

  const handleMouseEnter = (
    event: React.MouseEvent,
    node: Node<CashFlowNodeData>
  ) => {
    dispatch(handleNodeMouseEnter(node));
  };

  const handleMouseDoubleClick = async (
    event: React.MouseEvent,
    node: Node<CashFlowNodeData>
  ) => {
    if (event.button === 0) {
      dispatch(handleNodeMouseDoubleClick(node));
      const { id, startPeriod, endPeriod } = node.data;
      setSelectedParentStatementId(id);
      await dispatch(
        getTransactions({
          startPeriod,
          endPeriod,
          append: true,
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
