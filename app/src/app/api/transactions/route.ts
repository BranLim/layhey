export const dynamic = 'force-dynamic';

import { TransactionService } from '@/services/transaction-service';

export const GET = async (request: Request) => {
  var transactionService = new TransactionService();
  const transactions = await transactionService.getTransactions(
    '2024-01-01',
    '2024-12-30'
  );
  return Response.json(transactions);
};
