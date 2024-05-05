'use client';

import { Box, Flex, Spacer } from '@chakra-ui/react';
import { ActionMenu } from '@/components/ActionMenu';

export default function Home() {
  return (
    <main>
      <Box w={580}>
        <Flex mt={20}>
          <Spacer />
          <ActionMenu />
          <Spacer />
        </Flex>
      </Box>
    </main>
  );
}
