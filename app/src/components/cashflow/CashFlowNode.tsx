import React, { useEffect, useRef } from 'react';

import { Handle, NodeProps, Position } from 'reactflow';
import {
  Box,
  Button,
  CloseButton,
  Flex,
  HStack,
  IconButton,
  SimpleGrid,
  Spacer,
  Text,
  VStack,
} from '@chakra-ui/react';
import CashFlow from '@/types/CashFlow';
import { toFormattedDate } from '@/utils/date.utils';
import { useAppDispatch, useAppSelector } from '@/states/hooks';
import {
  handleNodeHide,
  selectNodeStyle,
  updateNodeSize,
} from '@/states/features/cashflow/flow.slice';
import { NodeToolbar } from '@reactflow/node-toolbar';
import { CashFlowToolbar } from '@/components/cashflow/CashFlowToolbar';
import Flow from '@/types/Flow';
import { CloseIcon } from '@chakra-ui/icons';

export const CashFlowNode = (props: NodeProps<Flow.CashFlowNodeData>) => {
  const dispatch = useAppDispatch();
  const nodeRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (nodeRef.current) {
      const { width, height } = nodeRef.current.getBoundingClientRect();
      dispatch(updateNodeSize({ id: props.id, width: width, height: height }));
    }
  }, [dispatch, props.id]);
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
            {props.data.rootNode && <Spacer />}
            {!props.data.rootNode && (
              <CloseButton
                aria-label='Hide cashflow node'
                alignSelf='center'
                marginRight={2}
                marginBottom={6}
                onClick={() => {
                  dispatch(handleNodeHide(props.id));
                }}
              />
            )}
          </HStack>

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
