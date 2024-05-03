'use server';

import { TransactionService } from '@/services/transaction-service';
import { TransactionDto } from '@/types/Transaction';
import { Option } from '@/types/Option';

export const add = async (
  newTransaction: TransactionDto,
  addOption?: Option
) => {
  var transactionService = new TransactionService();
  await transactionService.addTransaction(newTransaction, addOption);
};
