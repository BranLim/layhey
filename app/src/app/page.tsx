'use client';

import { ActionMenu } from '@/components/ActionMenu';
import { BudgetView } from '@/components/BudgetView';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import {
  getTransactions,
  selectBudgetPeriod,
  selectBudgetSummary,
  setBudgetPeriod,
} from '@/slices/transaction-slice';
import { selectIsOpenModal } from '@/slices/modal-slice';
import { useEffect } from 'react';
import { BudgetControl } from '@/components/budget/BudgetControl';
import { Flex } from '@chakra-ui/react';

export default function Home() {
  const dispatch = useAppDispatch();
  const budgetPeriod = useAppSelector(selectBudgetPeriod);
  const budgetSummary = useAppSelector(selectBudgetSummary);

  useEffect(() => {
    if (!budgetPeriod.startPeriod && !budgetPeriod.endPeriod) {
      console.log('Setting budget period');
      dispatch(
        setBudgetPeriod({ startPeriod: '2024-01-01', endPeriod: '2024-12-31' })
      );
      return;
    }
    console.log(`Updating Budget Period: ${JSON.stringify(budgetSummary)}`);
    dispatch(
      getTransactions({ startPeriod: '2024-01-01', endPeriod: '2024-12-31' })
    );
  }, [budgetPeriod.startPeriod, budgetPeriod.endPeriod]);

  return (
    <>
      <Flex alignItems='flex-start'>
        <ActionMenu />
      </Flex>

      <BudgetView />
    </>
  );
}
