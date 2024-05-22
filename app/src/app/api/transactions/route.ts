import { NextRequest } from 'next/server';
import {
  AddTransactionRequest,
  TransactionResponse,
} from '@/types/Transaction';
import { addTransaction, getTransactions } from '@/lib/actions/transaction';

export const dynamic = 'force-dynamic';

export const GET = async (request: NextRequest): Promise<Response> => {
  const parameters = request.nextUrl.searchParams;
  const startPeriod = parameters.get('startPeriod') ?? '';
  const endPeriod = parameters.get('endPeriod') ?? '';
  const transactions = await getTransactions(startPeriod, endPeriod);
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
  try {
    const transactionRequest: AddTransactionRequest = await request.json();
    await addTransaction(transactionRequest);
    return new Response('Transaction created', { status: 201 });
  } catch (error) {
    return new Response('Error adding transaction', { status: 500 });
  }
};
