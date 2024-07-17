import { SerializableTransaction, TransactionDto } from '@/types/Transaction';
import { Td, Tr, Text, Button } from '@chakra-ui/react';
import { toFormattedDate } from '@/utils/date.utils';
import { useAppDispatch } from '@/states/hooks';
import { closeModal, openModal } from '@/states/common/modal.slice';
import NextLink from 'next/link';

type Props = {
  transaction: SerializableTransaction;
};

export const TransactionListRow = (props: Props) => {
  const { transaction } = props;
  const numberFormatter = new Intl.NumberFormat('en-SG', {
    style: 'currency',
    currency: 'SGD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const dispatch = useAppDispatch();

  const handleUpdate = (modalId: string) => {
    dispatch(openModal(modalId));
    dispatch(closeModal('TransactionDrawer'));
  };

  return (
    <Tr>
      <Td>
        {transaction.date &&
          toFormattedDate(new Date(transaction.date), 'dd-MMM-yyyy')}
      </Td>
      <Td>{transaction.mode}</Td>
      <Td>{transaction.transactionCategory}</Td>
      <Td>
        <Text align={'right'}>
          {numberFormatter.format(transaction.amount)}
        </Text>
      </Td>
      <Td>
        <Button
          as={NextLink}
          colorScheme='blue'
          size='md'
          onClick={() => {
            handleUpdate('UpdateTransactionModal');
          }}
          href={`/transactions/update/${transaction.id}`}
        >
          Update
        </Button>
      </Td>
    </Tr>
  );
};
