import { Table, TableContainer, Tbody, Th, Thead, Tr } from '@chakra-ui/react';
import { Transaction } from 'mongodb';
import { TransactionDto } from '@/types/Transaction';
import { TransactionListRow } from '@/components/transaction/TransactionListRow';

type Props = {
  transactions: TransactionDto[];
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
            <Th>Amount</Th>
          </Tr>
        </Thead>
        <Tbody>
          {transactions &&
            transactions.map((transaction: TransactionDto) => {
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
