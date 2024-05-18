import React from 'react';

import { Handle, NodeProps, Position } from 'reactflow';
import { Box, Flex, SimpleGrid, Spacer, Text, VStack } from '@chakra-ui/react';
import { CashFlowNodeData } from '@/types/CashFlow';
import { toFormattedDate } from '@/utils/date-utils';

export const CashFlowSummaryNode = (props: NodeProps<CashFlowNodeData>) => {
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
        borderColor='black'
        borderRadius='12px'
        boxShadow='0px 0px 10px gray'
        zIndex={999}
      >
        {!props.data.rootNode && (
          <Handle type='source' position={Position.Top} />
        )}
        <VStack width='sm'>
          <Flex width='2xs' alignItems='flex-start'>
            <Box>
              <Text as={'b'} fontSize='md' align='center'>
                Start Period
              </Text>
              <Text fontSize='md' align='center'>
                {props.data.startPeriod &&
                  toFormattedDate(props.data.startPeriod, 'dd-MMM-yyyy')}
              </Text>
            </Box>
            <Spacer />
            <Box>
              <Text as={'b'} fontSize='md' align='center'>
                End Period
              </Text>
              <Text fontSize='md' align='center'>
                {props.data.endPeriod &&
                  toFormattedDate(props.data.endPeriod, 'dd-MMM-yyyy')}
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
