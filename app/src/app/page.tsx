'use client';

import { Box, Flex, Spacer } from '@chakra-ui/react';
import { ActionMenu } from '@/components/ActionMenu';
import { useRef } from 'react';

export default function Home() {
  return (
    <main>
      <Box w={580}>
        <ActionMenu />
      </Box>
    </main>
  );
}
