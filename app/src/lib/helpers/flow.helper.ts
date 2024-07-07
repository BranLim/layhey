import { Node } from '@reactflow/core';
import CashFlow from '@/types/CashFlow';
import Flow from '@/types/Flow';

const isColliding = (
  nodeA: Node<Flow.FlowNodeData>,
  nodeB: Node<Flow.FlowNodeData>
): boolean => {
  if (!nodeA.width || !nodeA.height || !nodeB.width || !nodeB.height) {
    throw new Error('width or height cannot be null or undefined');
  }
  return (
    nodeA.position.x < nodeB.position.x + nodeB.width &&
    nodeA.position.x + nodeA.width > nodeB.position.x &&
    nodeA.position.y < nodeB.position.y + nodeB.height &&
    nodeA.position.y +
      (nodeA.data!.isToolbarVisible ? nodeA.height + 38 : nodeA.height) >
      nodeB.position.y
  );
};

const resolveCollision = (
  nodeA: Node<Flow.FlowNodeData>,
  nodeB: Node<Flow.FlowNodeData>
): Node<Flow.FlowNodeData> => {
  const deltaX = nodeA.position.x - nodeB.position.x;
  const deltaY = nodeA.position.y - nodeB.position.y;

  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    // Horizontal collision
    if (deltaX > 0) {
      nodeA.position.x = nodeB.position.x + nodeB.width!; // Move right
    } else {
      nodeA.position.x = nodeB.position.x - nodeA.width!; // Move left
    }
  } else {
    // Vertical collision
    if (deltaY > 0) {
      nodeA.position.y = nodeB.position.y + nodeB.height!; // Move down
    } else {
      nodeA.position.y =
        nodeB.position.y -
        (nodeA.data!.isToolbarVisible ? nodeA.height! + 38 : nodeA.height!); // Move up
    }
  }
  return nodeA;
};

export const detectAndResolveCollisions = (
  updatedNode: Node<Flow.FlowNodeData>,
  existingNodes: Node<Flow.FlowNodeData>[]
): Node<Flow.FlowNodeData> => {
  const maxIteration = 10;
  let iterationCount = 0;
  let resolvedNode = { ...updatedNode };
  let hasCollision = true;

  while (hasCollision && iterationCount < maxIteration) {
    hasCollision = false;
    iterationCount++;
    for (const node of existingNodes) {
      if (node.id !== resolvedNode.id && isColliding(resolvedNode, node)) {
        resolvedNode = resolveCollision(resolvedNode, node);
        hasCollision = true;
      }
    }
  }

  return resolvedNode;
};
