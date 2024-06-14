import { Handle, NodeProps, Position } from 'reactflow';
import CashFlow from '@/types/CashFlow';
import { useAppSelector } from '@/states/hooks';
import { selectNodeStyle } from '@/states/features/cashflow/flow.slice';
import { Box, Flex, SimpleGrid, Spacer, Text, VStack } from '@chakra-ui/react';
import React from 'react';
import { toFormattedDate } from '@/utils/date.utils';

export const IncomeExpenseNode = (
  props: NodeProps<CashFlow.IncomeNodeData | CashFlow.ExpenseNodeData>
) => {
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
                {props.data.accountingPeriod.startPeriod &&
                  toFormattedDate(
                    new Date(props.data.accountingPeriod.startPeriod),
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
                {props.data.accountingPeriod.endPeriod &&
                  toFormattedDate(
                    new Date(props.data.accountingPeriod.endPeriod),
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
              {props.data.statementType === 'Income' ? 'Income' : 'Expense'}
            </Text>
            <Text fontSize='lg' align='right'>
              {numberFormatter.format(props.data.total)}
            </Text>
          </SimpleGrid>
        </VStack>
      </Box>
    </>
  );
};
