import React, { useMemo } from 'react';
import ReactFlow, {
  Background,
  BackgroundVariant,
  Node,
  NodeChange,
} from 'reactflow';
import { useAppDispatch, useAppSelector } from '@/states/hooks';
import { selectCashFlowStoreStatus } from '@/states/features/cashflow/cashflow.slice';
import { CashFlowNode } from '@/components/cashflow/CashFlowNode';
import 'reactflow/dist/style.css';
import {
  handleNodeMouseClick,
  handleNodeMouseDoubleClick,
  handleNodeMouseEnter,
  handleNodeMouseLeave,
  handleNodeMove,
  handleNodeSelection,
  selectFlowEdges,
  selectFlowNodes,
} from '@/states/features/cashflow/flow.slice';
import { Loading } from '@/components/common/Loading';
import { NoDataNode } from '@/components/cashflow/NoDataNode';
import { IncomeExpenseNode } from '@/components/cashflow/DetailedStatementNode';
import Flow from '@/types/Flow';

const nodeDragThreshold = 6;
export const defaultViewPort = { x: 10, y: 20, zoom: 0.8 };

export const CashFlowView = () => {
  const dispatch = useAppDispatch();
  const nodeTypes = useMemo(
    () => ({
      cashFlowNode: CashFlowNode,
      noDataNode: NoDataNode,
      incomeExpenseNode: IncomeExpenseNode,
    }),
    []
  );
  const cashFlowStoreStateStatus = useAppSelector(selectCashFlowStoreStatus);
  const nodes = useAppSelector(selectFlowNodes);
  const edges = useAppSelector(selectFlowEdges);

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
    node: Node<Flow.FlowNodeData>
  ) => {
    dispatch(handleNodeMouseLeave(node));
  };

  const handleMouseEnter = (
    event: React.MouseEvent,
    node: Node<Flow.FlowNodeData>
  ) => {
    dispatch(handleNodeMouseEnter(node));
  };

  const handleMouseClick = async (
    event: React.MouseEvent,
    node: Node<Flow.FlowNodeData>
  ) => {
    if (event.button === 0) {
      dispatch(handleNodeMouseClick(node));
    }
  };

  const handleMouseDoubleClick = async (
    event: React.MouseEvent,
    node: Node<Flow.FlowNodeData>
  ) => {
    if (event.button === 0) {
      dispatch(handleNodeMouseDoubleClick(node));
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
        onNodeClick={handleMouseClick}
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
