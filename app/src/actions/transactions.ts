'use server';

import { TransactionService } from '@/services/transaction-service';
import { Transaction } from '@/types/Transaction';

const add = async (newTransaction: Transaction) => {
  var transactionService = new TransactionService();
  await transactionService.addTransaction(newTransaction);
};

export default add;
