'use client';

import { ChakraProvider } from '@chakra-ui/react';
import { useRef } from 'react';
import { AppStore, makeStore } from '@/states/store';
import { Provider } from 'react-redux';
import { ReactFlowProvider } from 'reactflow';

export function Providers({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<AppStore>();
  if (!storeRef.current) {
    storeRef.current = makeStore();
  }
  return (
    <Provider store={storeRef.current}>
      <ReactFlowProvider>
        <ChakraProvider>{children}</ChakraProvider>
      </ReactFlowProvider>
    </Provider>
  );
}
