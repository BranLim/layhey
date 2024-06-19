import { Node } from '@reactflow/core';
import CashFlow from '@/types/CashFlow';

const isColliding = (
  nodeA: Node<CashFlow.FlowNodeData>,
  nodeB: Node<CashFlow.FlowNodeData>
): boolean => {
  if (!nodeA.width || !nodeA.height || !nodeB.width || !nodeB.height) {
    throw new Error('width or height cannot be null or undefined');
  }
  return (
    nodeA.position.x < nodeB.position.x + (nodeB.width - 10) &&
    nodeA.position.x + (nodeA.width - 10) > nodeB.position.x &&
    nodeA.position.y < nodeB.position.y + (nodeB.height - 10) &&
    nodeA.position.y + (nodeA.height - 10) > nodeB.position.y
  );
};

export const detectAndResolveCollisions = (
  updatedNode: Node<CashFlow.FlowNodeData>,
  existingNodes: Node<CashFlow.FlowNodeData>[]
): Node<CashFlow.FlowNodeData> => {
  let resolvedNode = { ...updatedNode };

  for (const node of existingNodes) {
    if (node.id !== resolvedNode.id && isColliding(resolvedNode, node)) {
      const deltaX = resolvedNode.position.x - node.position.x;
      const deltaY = resolvedNode.position.y - node.position.y;

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal collision
        if (deltaX > 0) {
          resolvedNode.position.x = node.position.x + node.width!; // Move right
        } else {
          resolvedNode.position.x = node.position.x - resolvedNode.width!; // Move left
        }
      } else {
        // Vertical collision
        if (deltaY > 0) {
          resolvedNode.position.y = node.position.y + node.height!; // Move down
        } else {
          resolvedNode.position.y = node.position.y - resolvedNode.height!; // Move up
        }
      }
      break;
    }
  }

  return resolvedNode;
};
