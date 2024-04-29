export const dynamic = 'force-dynamic';

import { TransactionService } from '@/services/transaction-service';

export const GET = async (request: Request) => {
  var transactionService = new TransactionService();
  const transactions = await transactionService.getTransactions('', '');
  return Response.json(transactions);
};
