import { TransactionDto } from '@/types/Transaction';

export const dynamic = 'force-dynamic';

import { TransactionService } from '@/services/transaction-service';

export const GET = async (request: Request): Promise<Response> => {
  var transactionService = new TransactionService();
  const transactions = await transactionService.getTransactions(
    '2023-01-01',
    '2024-12-30'
  );
  return Response.json(transactions);
};

export const POST = async (request: Request): Promise<Response> => {
  const transactionRequest = await request.json();
  var transactionService = new TransactionService();
  await transactionService.addTransaction(transactionRequest, undefined);
  return new Response('Transaction created', { status: 201 });
};
