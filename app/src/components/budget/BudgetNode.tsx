import { Handle, NodeProps, Position } from 'reactflow';
import { Box, Heading, SimpleGrid, Text } from '@chakra-ui/react';
import { useCallback } from 'react';

export type BudgetNodeData = {
  inflow: number;
  outflow: number;
  difference: number;
};

export const BudgetNode = (props: NodeProps<BudgetNodeData>) => {
  return (
    <>
      <Box
        bg='white'
        maxWidth='xs'
        border='2px'
        borderColor='darkgray'
        borderRadius='12px'
        boxShadow='0px 0px 12px 2px gray'
        zIndex={999}
      >
        <Handle type='source' position={Position.Top} draggable={true} />
        <SimpleGrid columns={2} gap={4} p={2}>
          <Heading fontSize='md'>Income</Heading>
          <Text fontSize='lg'>{props.data.inflow}</Text>

          <Heading fontSize='md'>Expense</Heading>
          <Text fontSize='lg'>{props.data.outflow}</Text>

          <Heading fontSize='md'>Surplus/Deficit</Heading>
          <Text fontSize='lg'>{props.data.difference}</Text>
        </SimpleGrid>
        <Handle type='target' position={Position.Bottom} draggable={true} />
      </Box>
    </>
  );
};
