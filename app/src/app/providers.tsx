'use client';

import { ChakraProvider } from '@chakra-ui/react';
import { useRef } from 'react';
import { AppStore, makeStore } from '@/states/store';
import { Provider } from 'react-redux';
import { ReactFlowProvider } from 'reactflow';
import { SerializableAccountingPeriod } from '@/types/StatementPeriod';
import { setCurrentAccountingPeriod } from '@/states/features/cashflow/flow.slice';
import { setOverallCashFlowStatementPeriod } from '@/states/features/cashflow/cashflow.slice';
import { getAccountingPeriods } from '@/states/features/accounting/accounting.slice';
import { getCurrentYear, toFormattedDate } from '@/utils/date.utils';
import { getOverallCashFlowSummary } from '@/states/features/cashflow/getOverallCashFlowSummary.thunk';

const currentYear = getCurrentYear();
const accountingPeriodStart = new Date(currentYear, 0, 1);
const accountingPeriodEnd = new Date(currentYear, 11, 31);

export function Providers({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<AppStore>();
  if (!storeRef.current) {
    const newStore = makeStore();
    storeRef.current = newStore;

    const accountingPeriod: SerializableAccountingPeriod = {
      startPeriod: accountingPeriodStart.toISOString(),
      endPeriod: accountingPeriodEnd.toISOString(),
    };

    if (typeof window !== 'undefined') {
      newStore.dispatch(setCurrentAccountingPeriod(accountingPeriod));
      newStore.dispatch(setOverallCashFlowStatementPeriod(accountingPeriod));
      newStore.dispatch(getAccountingPeriods());
      newStore.dispatch(
        getOverallCashFlowSummary({
          startPeriod: toFormattedDate(accountingPeriodStart, 'yyyy-MM-dd'),
          endPeriod: toFormattedDate(accountingPeriodEnd, 'yyyy-MM-dd'),
          reset: true,
          parentStatementSlotId: '',
          parentNodeId: '',
        })
      );
    }
  }

  return (
    <Provider store={storeRef.current}>
      <ReactFlowProvider>
        <ChakraProvider>{children}</ChakraProvider>
      </ReactFlowProvider>
    </Provider>
  );
}
