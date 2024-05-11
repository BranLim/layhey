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

export default function Home() {
  const dispatch = useAppDispatch();
  const budgetPeriod = useAppSelector(selectBudgetPeriod);
  const budgetSummary = useAppSelector(selectBudgetSummary);
  const modalClose = useAppSelector(selectIsOpenModal);

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

  useEffect(() => {
    if (!budgetPeriod.startPeriod && !budgetPeriod.endPeriod) {
      return;
    }
    console.log(`Updating Budget Summary: ${JSON.stringify(budgetSummary)}`);
  }, [
    modalClose,
    budgetSummary.inflow,
    budgetSummary.outflow,
    budgetSummary.difference,
  ]);
  return (
    <>
      <ActionMenu />
      <BudgetView />
    </>
  );
}
