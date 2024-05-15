import { TransactionService } from '@/services/transaction-service';
import { NextRequest } from 'next/server';
import { TransactionResponse } from '@/types/Transaction';

export const dynamic = 'force-dynamic';

export const GET = async (request: NextRequest): Promise<Response> => {
  const parameters = request.nextUrl.searchParams;
  const startPeriod = parameters.get('startPeriod') ?? '';
  const endPeriod = parameters.get('endPeriod') ?? '';
  var transactionService = new TransactionService();
  const transactions = await transactionService.getTransactions(
    startPeriod,
    endPeriod
  );
  const transactionResponse = transactions.map((transaction) => {
    return {
      id: transaction.id,
      date: transaction.date.toISOString(),
      amount: transaction.amount,
      category: transaction.category,
      transactionSource: transaction.transactionSource,
      transactionType: transaction.transactionType,
      currency: transaction.currency,
    } as TransactionResponse;
  });
  return Response.json(transactionResponse);
};

export const POST = async (request: NextRequest): Promise<Response> => {
  const transactionRequest = await request.json();
  var transactionService = new TransactionService();
  await transactionService.addTransaction(transactionRequest, undefined);
  return new Response('Transaction created', { status: 201 });
};
