'use client';

import { Box, Flex, Spacer } from '@chakra-ui/react';
import { ActionMenu } from '@/components/ActionMenu';
import { useRef } from 'react';
import { Header } from '@/components/Header';
import { MainContent } from '@/components/MainContent';

export default function Home() {
  return (
    <main>
      <MainContent />
    </main>
  );
}
