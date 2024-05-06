'use client';

import { Box, Flex, Spacer } from '@chakra-ui/react';
import { ActionMenu } from '@/components/ActionMenu';
import { useRef } from 'react';
import { Header } from '@/components/Header';
import { Body } from '@/components/Body';

export default function Home() {
  return (
    <main>
      <Header />
      <Body />
    </main>
  );
}
