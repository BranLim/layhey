import { Container } from '@chakra-ui/react';
import { ActionMenu } from '@/components/ActionMenu';
import { useDispatch, useSelector } from 'react-redux';
import { selectIsOpenModal } from '@/slices/modal-slice';
import {
  selectBudgetPeriod,
  selectBudgetSummary,
  setBudgetPeriod,
} from '@/slices/transaction-slice';
import { useEffect } from 'react';

export const MainContent = () => {
  const dispatch = useDispatch();
  const budgetPeriod = useSelector(selectBudgetPeriod);
  const budgetSummary = useSelector(selectBudgetSummary);
  const modalClose = useSelector(selectIsOpenModal);

  useEffect(() => {
    if (!budgetPeriod.startPeriod && !budgetPeriod.endPeriod) {
      console.log('Setting budget period');
      dispatch(
        setBudgetPeriod({ startPeriod: '2024-01-01', endPeriod: '2024-12-31' })
      );
      return;
    }
    console.log(`Updating Budget Period: ${JSON.stringify(budgetSummary)}`);
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
    <Container>
      <ActionMenu />
    </Container>
  );
};
