import { Handle, NodeProps, Position } from 'reactflow';
import CashFlow from '@/types/CashFlow';
import { useAppSelector } from '@/states/hooks';
import { selectNodeStyle } from '@/states/features/cashflow/flow.slice';
import { Box, Flex, Spacer, Text } from '@chakra-ui/react';
import React from 'react';

export const NoDataNode = (props: NodeProps<CashFlow.CashFlowNodeData>) => {
  const nodeStyle = useAppSelector((state) => selectNodeStyle(state, props.id));

  return (
    <>
      <Box
        style={{ ...nodeStyle }}
        bg='whitesmoke'
        width='xs'
        border='3px solid black'
        borderRadius='12px'
        boxShadow='0px 0px 12px darkslategray'
        height='80px'
        zIndex={999}
      >
        {!props.data.rootNode && (
          <Handle type='source' position={Position.Left} />
        )}

        <Flex width='xs' align='center' justify='center'>
          <Spacer />
          <Text as={'b'} fontSize='lg' textAlign='center' height='100%'>
            No data
          </Text>
          <Spacer />
        </Flex>
      </Box>
    </>
  );
};
