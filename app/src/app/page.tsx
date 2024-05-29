'use client';

import { ActionMenu } from '@/components/ActionMenu';
import { CashFlowView } from '@/components/cashflow/CashFlowView';
import { CashFlowViewControl } from '@/components/cashflow/CashFlowViewControl';
import { Flex } from '@chakra-ui/react';
import { useAppDispatch } from '@/states/hooks';
import { getAccountingPeriods } from '@/states/features/accounting/accounting.slice';
import { useEffect } from 'react';

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
