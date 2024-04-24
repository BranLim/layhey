'use server';

import { TransactionService } from '@/services/transaction-service';

const add = async () => {
  var transactionService = new TransactionService();
  await transactionService.addTransaction({
    id: '1',
    amount: 3.0,
    category: 'test',
    currency: 'SGD',
    date: new Date(),
  });
};

export default add;
