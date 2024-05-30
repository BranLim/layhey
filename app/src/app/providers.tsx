'use client';

import { ChakraProvider } from '@chakra-ui/react';
import { useRef } from 'react';
import { AppStore, makeStore } from '@/states/store';
import { Provider } from 'react-redux';
import { ReactFlowProvider } from 'reactflow';
import { getAccountingPeriods } from '@/states/features/accounting/accounting.slice';
import { getCurrentYear } from '@/utils/date.utils';
import { setCurrentAccountingPeriod } from '@/states/features/cashflow/flow.slice';
import { setCashFlowAccountingPeriod } from '@/states/features/cashflow/cashflow.slice';

const currentYear = getCurrentYear();
const startOfYear = new Date(currentYear, 0, 1);
const endOfYear = new Date(currentYear, 11, 31);

export function Providers({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<AppStore>();
  if (!storeRef.current) {
    const newStore = makeStore();
    storeRef.current = newStore;
    newStore.dispatch(
      setCurrentAccountingPeriod({
        startPeriod: startOfYear.toISOString(),
        endPeriod: endOfYear.toISOString(),
      })
    );
    newStore.dispatch(
      setCashFlowAccountingPeriod({
        startPeriod: startOfYear.toISOString(),
        endPeriod: startOfYear.toISOString(),
      })
    );
    newStore.dispatch(getAccountingPeriods());
  }
  return (
    <Provider store={storeRef.current}>
      <ReactFlowProvider>
        <ChakraProvider>{children}</ChakraProvider>
      </ReactFlowProvider>
    </Provider>
  );
}
