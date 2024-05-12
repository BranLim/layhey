import React from 'react';

import { Handle, NodeProps, Position } from 'reactflow';
import { Box, Flex, SimpleGrid, Spacer, Text, VStack } from '@chakra-ui/react';
import { BudgetSummary } from '@/types/Budget';

export const BudgetNode = (props: NodeProps<BudgetSummary>) => {
  const numberFormatter = new Intl.NumberFormat('en-SG', {
    style: 'currency',
    currency: 'SGD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return (
    <>
      <Box
        bg='white'
        width='sm'
        border='2px'
        borderColor='darkgray'
        borderRadius='12px'
        boxShadow='0px 0px 12px 2px gray'
        zIndex={999}
      >
        <Handle type='source' position={Position.Top} />
        <VStack width='sm'>
          <Flex width='2xs'>
            <Box>
              <Text as={'b'} fontSize='md' align='center'>
                Start Period
              </Text>
              <Text fontSize='md' align='center'>
                {props.data.startPeriod}
              </Text>
            </Box>
            <Spacer />
            <Box>
              <Text as={'b'} fontSize='md' align='center'>
                End Period
              </Text>
              <Text fontSize='md' align='center'>
                {props.data.endPeriod}
              </Text>
            </Box>
          </Flex>

          <SimpleGrid
            width='xs'
            columns={2}
            rowGap={2}
            columnGap={2}
            padding={2}
          >
            <Text as={'b'} fontSize='md'>
              Income
            </Text>
            <Text fontSize='md' align='right'>
              {numberFormatter.format(props.data.inflow)}
            </Text>

            <Text as={'b'} fontSize='md'>
              Expense
            </Text>
            <Text fontSize='md' align='right'>
              {numberFormatter.format(props.data.outflow)}
            </Text>

            <Text as={'b'} fontSize='md' fontWeight=''>
              Surplus/Deficit
            </Text>
            <Text fontSize='md' align='right'>
              {numberFormatter.format(props.data.difference)}
            </Text>
          </SimpleGrid>
        </VStack>

        <Handle type='target' position={Position.Bottom} />
      </Box>
    </>
  );
};
