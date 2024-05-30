'use client';

import { ChakraProvider } from '@chakra-ui/react';
import { useRef } from 'react';
import { AppStore, makeStore } from '@/states/store';
import { Provider } from 'react-redux';
import { ReactFlowProvider } from 'reactflow';
import { getAccountingPeriods } from '@/states/features/accounting/accounting.slice';
import { getCurrentYear, toFormattedDate } from '@/utils/date.utils';
import { setCurrentAccountingPeriod } from '@/states/features/cashflow/flow.slice';
import {
  getTransactions,
  setCashFlowAccountingPeriod,
} from '@/states/features/cashflow/cashflow.slice';
import {
  AccountingPeriod,
  SerializableAccountingPeriod,
} from '@/types/AccountingPeriod';

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

    (async () => {
      await Promise.all([
        newStore.dispatch(setCurrentAccountingPeriod(accountingPeriod)),
        newStore.dispatch(getAccountingPeriods()),
        newStore.dispatch(setCashFlowAccountingPeriod(accountingPeriod)),
      ]);
      newStore.dispatch(
        getTransactions({
          startPeriod: toFormattedDate(accountingPeriodStart, 'yyyy-MM-dd'),
          endPeriod: toFormattedDate(accountingPeriodEnd, 'yyyy-MM-dd'),
        })
      );
    })();
  }
  return (
    <Provider store={storeRef.current}>
      <ReactFlowProvider>
        <ChakraProvider>{children}</ChakraProvider>
      </ReactFlowProvider>
    </Provider>
  );
}
