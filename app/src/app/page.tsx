'use client';

import { ActionMenu } from '@/components/ActionMenu';
import { CashFlowView } from '@/components/cashflow/CashFlowView';
import { CashFlowViewControl } from '@/components/cashflow/CashFlowViewControl';
import { Flex } from '@chakra-ui/react';
import { useEffect } from 'react';
import { SerializableAccountingPeriod } from '@/types/AccountingPeriod';
import { setCurrentAccountingPeriod } from '@/states/features/cashflow/flow.slice';
import {
  getTransactions,
  selectIsInitialised,
  setCashFlowAccountingPeriod,
  setInitialised,
} from '@/states/features/cashflow/cashflow.slice';
import { getAccountingPeriods } from '@/states/features/accounting/accounting.slice';
import { getCurrentYear, toFormattedDate } from '@/utils/date.utils';
import { useAppDispatch, useAppSelector } from '@/states/hooks';

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
