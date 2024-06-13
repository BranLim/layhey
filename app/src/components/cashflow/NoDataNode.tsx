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

        <Flex align='center' justify='center' height='100%'>
          <Text as={'b'} fontSize='lg' verticalAlign='middle'>
            No data
          </Text>
        </Flex>
      </Box>
    </>
  );
};
