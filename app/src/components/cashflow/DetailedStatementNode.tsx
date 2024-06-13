import { Handle, NodeProps, Position } from 'reactflow';
import CashFlow from '@/types/CashFlow';
import { useAppSelector } from '@/states/hooks';
import { selectNodeStyle } from '@/states/features/cashflow/flow.slice';
import { Box, Flex, Spacer, Text, VStack } from '@chakra-ui/react';
import React from 'react';
import { toFormattedDate } from '@/utils/date.utils';

export const IncomeExpenseNode = (
  props: NodeProps<CashFlow.IncomeNodeData | CashFlow.ExpenseNodeData>
) => {
  const nodeStyle = useAppSelector((state) => selectNodeStyle(state, props.id));

  return (
    <>
      <Box
        style={{ ...nodeStyle }}
        bg='whitesmoke'
        width='3xs'
        border='3px solid black'
        borderRadius='12px'
        boxShadow='0px 0px 12px darkslategray'
        height='80px'
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
        </VStack>
      </Box>
    </>
  );
};
