'use client';

import { ActionMenu } from '@/components/ActionMenu';
import { CashFlowView } from '@/components/CashFlowView';
import { CashFlowViewControl } from '@/components/budget/CashFlowViewControl';
import { Flex } from '@chakra-ui/react';

export default function Home() {
  return (
    <>
      <CashFlowView />
      <Flex flexWrap='wrap' width='lg'>
        <CashFlowViewControl />
        <ActionMenu />
      </Flex>
    </>
  );
}
