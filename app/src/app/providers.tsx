// app/providers.tsx
'use client';

import { ChakraProvider } from '@chakra-ui/react';
import { useRef } from 'react';
import { AppStore, makeStore } from '@/states/store';
import { Provider } from 'react-redux';

export function Providers({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<AppStore>();
  if (!storeRef.current) {
    storeRef.current = makeStore();
  }
  return (
    <Provider store={storeRef.current}>
      <ChakraProvider>{children}</ChakraProvider>
    </Provider>
  );
}
