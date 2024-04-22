'use client';

import { Box, Button } from '@chakra-ui/react';
import add from '@/actions/transactions';

export default function Home() {
  return (
    <Box>
      <Button onClick={() => add()}>Add Transaction</Button>
    </Box>
  );
}
