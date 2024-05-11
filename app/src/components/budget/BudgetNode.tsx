import { NodeProps } from 'reactflow';
import { Box, Heading, SimpleGrid, Text } from '@chakra-ui/react';

type BudgetNodeData = {
  inflow: number;
  outflow: number;
  difference: number;
};

export const BudgetNode = (props: NodeProps<BudgetNodeData>) => {
  return (
    <Box
      bg='white'
      maxWidth='xs'
      border='1px'
      borderRadius='4px'
      boxShadow='2px 2px 2px 3px lightgray'
    >
      <SimpleGrid columns={2} gap={4} p={2}>
        <Heading fontSize='md'>Income</Heading>
        <Text fontSize='lg'>{props.data.inflow}</Text>

        <Heading fontSize='md'>Expense</Heading>
        <Text fontSize='lg'>{props.data.outflow}</Text>

        <Heading fontSize='md'>Surplus/Deficit</Heading>
        <Text fontSize='lg'>{props.data.difference}</Text>
      </SimpleGrid>
    </Box>
  );
};
