import { SerializableTransaction, TransactionDto } from '@/types/Transaction';
import { Td, Tr, Text } from '@chakra-ui/react';
import { toFormattedDate } from '@/utils/date.utils';

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
    </Tr>
  );
};
