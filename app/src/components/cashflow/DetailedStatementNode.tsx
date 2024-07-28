import { Handle, NodeProps, Position } from 'reactflow';
import { useAppDispatch, useAppSelector } from '@/states/hooks';
import {
  handleNodeHide,
  selectNodeStyle,
} from '@/states/features/cashflow/flow.slice';
import {
  Box,
  Button,
  CloseButton,
  Flex,
  HStack,
  SimpleGrid,
  Spacer,
  Text,
  VStack,
} from '@chakra-ui/react';
import React from 'react';
import { toFormattedDate } from '@/utils/date.utils';
import { CashFlowToolbar } from '@/components/cashflow/CashFlowToolbar';
import Flow from '@/types/Flow';

export const IncomeExpenseNode = (
  props: NodeProps<Flow.IncomeNodeData | Flow.ExpenseNodeData>
) => {
  const dispatch = useAppDispatch();
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
        <CashFlowToolbar isVisible={props.data.isToolbarVisible} />

        <VStack width='sm'>
          <HStack width='sm' alignItems='center'>
            <Spacer />
            <VStack rowGap='1'>
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
            </VStack>
            <Spacer />
            <VStack rowGap='1'>
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
            </VStack>
            <Spacer />
            <CloseButton
              aria-label='Hide cashflow node'
              alignSelf='center'
              marginRight={2}
              marginBottom={6}
              onClick={() => {
                dispatch(handleNodeHide(props.id));
              }}
            />
          </HStack>
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
