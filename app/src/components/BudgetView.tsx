import { Box } from '@chakra-ui/react';
import ReactFlow, { Background, Controls } from 'reactflow';

export const BudgetView = () => {
  return (
    <ReactFlow>
      <Background />
      <Controls />
    </ReactFlow>
  );
};
