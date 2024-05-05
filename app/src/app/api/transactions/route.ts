import { TransactionDto } from '@/types/Transaction';

export const dynamic = 'force-dynamic';

import { TransactionService } from '@/services/transaction-service';
import { NextRequest } from 'next/server';

export const GET = async (request: NextRequest): Promise<Response> => {
  const parameters = request.nextUrl.searchParams;
  const startPeriod = parameters.get('startPeriod') ?? '';
  const endPeriod = parameters.get('endPeriod') ?? '';
  var transactionService = new TransactionService();
  const transactions = await transactionService.getTransactions(
    startPeriod,
    endPeriod
  );
  return Response.json(transactions);
};

export const POST = async (request: NextRequest): Promise<Response> => {
  const transactionRequest = await request.json();
  var transactionService = new TransactionService();
  await transactionService.addTransaction(transactionRequest, undefined);
  return new Response('Transaction created', { status: 201 });
};

export const PUT = async (requet: NextRequest): Promise<Response> => {
  return new Response();
};
