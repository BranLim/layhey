import { Table, TableContainer, Tbody, Th, Thead, Tr } from '@chakra-ui/react';
import { SerializableTransaction, TransactionDto } from '@/types/Transaction';
import { TransactionListRow } from '@/components/transaction/TransactionListRow';

type Props = {
  transactions: SerializableTransaction[];
};

export const TransactionList = (props: Props) => {
  const { transactions } = props;
  return (
    <TableContainer>
      <Table>
        <Thead>
          <Tr>
            <Th>Date</Th>
            <Th>Type</Th>
            <Th>Category</Th>
            <Th>Amount</Th>
            <Th></Th>
          </Tr>
        </Thead>
        <Tbody>
          {transactions &&
            transactions.map((transaction: SerializableTransaction) => {
              return (
                <TransactionListRow
                  key={transaction.id}
                  transaction={transaction}
                />
              );
            })}
        </Tbody>
      </Table>
    </TableContainer>
  );
};
