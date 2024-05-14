'use client';

import { ActionMenu } from '@/components/ActionMenu';
import { BudgetView } from '@/components/BudgetView';
import { BudgetControl } from '@/components/budget/BudgetControl';
import { Flex } from '@chakra-ui/react';

export default function Home() {
  return (
    <>
      <BudgetView />
      <Flex flexWrap='wrap' width='lg'>
        <BudgetControl />
        <ActionMenu />
      </Flex>
    </>
  );
}
