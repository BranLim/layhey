import { SerializableTransaction, TransactionDto } from '@/types/Transaction';
import { Td, Tr } from '@chakra-ui/react';
import { toFormattedDate } from '@/utils/date.utils';

type Props = {
  transaction: SerializableTransaction;
};

export const TransactionListRow = (props: Props) => {
  const { transaction } = props;
  return (
    <Tr>
      <Td>
        {transaction.date &&
          toFormattedDate(new Date(transaction.date), 'dd-MMM-yyyy')}
      </Td>
      <Td>{transaction.transactionCategory}</Td>
      <Td>${transaction.amount}</Td>
    </Tr>
  );
};
