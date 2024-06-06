import React, {useEffect, useMemo, useState} from 'react';
import ReactFlow, {
    Background,
    BackgroundVariant,
    Node,
    NodeChange,
} from 'reactflow';
import {useAppDispatch, useAppSelector} from '@/states/hooks';
import {
    getTransactions,
    selectInitialCashFlowStatements,
    selectCashFlowStoreStatus,
    selectCashFlowSummary, selectSubsequentCashFlowStatements,
} from '@/states/features/cashflow/cashflow.slice';
import {CashFlowNode} from '@/components/cashflow/CashFlowNode';
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
    selectLatestExpandedNode,
    selectFlowViewStatus,
    addCashFlows,
} from '@/states/features/cashflow/flow.slice';
import {Loading} from '@/components/common/Loading';
import {CashFlowNodeData} from '@/types/CashFlow';

const nodeDragThreshold = 6;
export const defaultViewPort = {x: 10, y: 20, zoom: 0.8};

export const CashFlowView = () => {
    const dispatch = useAppDispatch();
    const nodeTypes = useMemo(() => ({cashFlowNode: CashFlowNode}), []);
    const cashFlowStoreStateStatus = useAppSelector(selectCashFlowStoreStatus);
    const flowViewStatus = useAppSelector(selectFlowViewStatus);
    const cashFlowSummary = useAppSelector(selectCashFlowSummary);
    const [selectedParentStatementId, setSelectedParentStatementId] =
        useState<string>('');
    const latestExpandedNode = useAppSelector(selectLatestExpandedNode);
    const allCashFlowsForPeriod = useAppSelector(selectInitialCashFlowStatements);
    const subsequenbtCashFlows = useAppSelector( selectSubsequentCashFlowStatements);
    const nodes = useAppSelector(selectFlowNodes);
    const edges = useAppSelector(selectFlowEdges);

    useEffect(() => {
        if (flowViewStatus === 'initial_node_load') {
            setSelectedParentStatementId(cashFlowSummary.id);
        }
        if (flowViewStatus === 'node_expansion' && latestExpandedNode) {
            setSelectedParentStatementId(latestExpandedNode.data.id);
        }
    }, [flowViewStatus, cashFlowSummary.id, latestExpandedNode?.data?.id]);

    useEffect(() => {
        if (
            cashFlowStoreStateStatus !== 'compute_completed' &&
            cashFlowStoreStateStatus !== 'load_complete'
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
        dispatch(setInitialCashFlows(payload));
    }, [dispatch, cashFlowStoreStateStatus]);

    useEffect(() => {
        if (
            flowViewStatus !== 'node_expansion' &&
            cashFlowStoreStateStatus !== 'load_complete'
        ) {
            return;
        }
        if (latestExpandedNode) {
            dispatch(addCashFlows({targetNodeId: latestExpandedNode.id, cashFlowSummaries:}));
        }
    }, [cashFlowStoreStateStatus, flowViewStatus, latestExpandedNode?.id]);

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

    const handleMouseDoubleClick = (
        event: React.MouseEvent,
        node: Node<CashFlowNodeData>
    ) => {
        if (event.button === 0) {
            dispatch(handleNodeMouseDoubleClick(node));
            const {id, startPeriod, endPeriod} = node.data;
            dispatch(
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
            {cashFlowStoreStateStatus === 'loading' && <Loading/>}
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                proOptions={{hideAttribution: true}}
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
                    style={{background: 'slategrey'}}
                />
            </ReactFlow>
        </>
    );
};
