import { Position } from 'reactflow';
import { Button } from '@chakra-ui/react';
import { NodeToolbar } from '@reactflow/node-toolbar';
import React from 'react';
import { useAppDispatch } from '@/states/hooks';
import { openModal } from '@/states/common/modal.slice';

type Props = {
  isVisible: boolean;
};

export const CashFlowToolbar = (props: Props) => {
  const dispatch = useAppDispatch();

  return (
    <>
      <NodeToolbar
        position={Position.Bottom}
        isVisible={props.isVisible}
        style={{ top: '-10px' }}
      >
        <Button
          size='xs'
          onClick={() => {
            dispatch(openModal('TransactionDrawer'));
          }}
        >
          Details
        </Button>
      </NodeToolbar>
    </>
  );
};
