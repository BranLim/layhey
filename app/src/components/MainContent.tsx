import { Container } from '@chakra-ui/react';
import { ActionMenu } from '@/components/ActionMenu';
import { useSelector } from 'react-redux';
import { selectIsOpenModal } from '@/slices/modal-slice';
import { selectBudgetSummary } from '@/slices/transaction-slice';
import { useEffect } from 'react';

export const MainContent = () => {
  const budgetSummary = useSelector(selectBudgetSummary);
  useEffect(() => {
    console.log(budgetSummary);
  }, [budgetSummary]);

  return (
    <Container>
      <ActionMenu />
    </Container>
  );
};
