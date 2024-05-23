import React from 'react';

import { Handle, NodeProps, Position } from 'reactflow';
import { Box, Flex, SimpleGrid, Spacer, Text, VStack } from '@chakra-ui/react';
import { CashFlowNodeData } from '@/types/CashFlow';
import { toFormattedDate } from '@/utils/date-utils';
import { useAppSelector } from '@/states/hooks';
import { selectNodeStyle } from '@/states/features/cashflow/flow.slice';

export const CashFlowNode = (props: NodeProps<CashFlowNodeData>) => {
  const nodeStyle = useAppSelector((state) => selectNodeStyle(state, props.id));
  const numberFormatter = new Intl.NumberFormat('en-SG', {
    style: 'currency',
    currency: 'SGD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <>
      <Box
        style={{ ...nodeStyle }}
        bg='whitesmoke'
        width='sm'
        border='3px solid black'
        borderRadius='12px'
        boxShadow='0px 0px 12px darkslategray'
        zIndex={999}
      >
        {!props.data.rootNode && (
          <Handle type='source' position={Position.Left} />
        )}
        <VStack width='sm'>
          <Flex width='2xs'>
            <Box>
              <Text as={'b'} fontSize='lg' align='center'>
                Start Period
              </Text>
              <Text fontSize='lg' align='center'>
                {props.data.startPeriod &&
                  toFormattedDate(
                    new Date(props.data.startPeriod),
                    'dd-MMM-yyyy'
                  )}
              </Text>
            </Box>
            <Spacer />
            <Box>
              <Text as={'b'} fontSize='lg' align='center'>
                End Period
              </Text>
              <Text fontSize='lg' align='center'>
                {props.data.endPeriod &&
                  toFormattedDate(
                    new Date(props.data.endPeriod),
                    'dd-MMM-yyyy'
                  )}
              </Text>
            </Box>
          </Flex>

          <SimpleGrid
            width='xs'
            columns={2}
            rowGap={1}
            columnGap={2}
            padding={2}
          >
            <Text as={'b'} fontSize='lg'>
              Income
            </Text>
            <Text fontSize='lg' align='right'>
              {numberFormatter.format(props.data.inflow)}
            </Text>

            <Text as={'b'} fontSize='lg'>
              Expense
            </Text>
            <Text fontSize='lg' align='right'>
              {numberFormatter.format(props.data.outflow)}
            </Text>

            <Text as={'b'} fontSize='lg'>
              Surplus/Deficit
            </Text>
            <Text
              as={'b'}
              fontSize='lg'
              align='right'
              color={
                props.data.difference > 0
                  ? 'seagreen'
                  : props.data.difference < 0
                    ? 'firebrick'
                    : 'black'
              }
            >
              {numberFormatter.format(props.data.difference)}
            </Text>
          </SimpleGrid>
        </VStack>

        <Handle type='target' position={Position.Right} />
      </Box>
    </>
  );
};
