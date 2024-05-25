import { NextRequest } from 'next/server';
import {
  AddTransactionRequest,
  Transaction,
  TransactionResponse,
} from '@/types/Transaction';
import {
  addTransaction,
  getTransactions,
} from '@/lib/actions/transaction.action';
import { toTransactionResponse } from '@/lib/mappers/transaction.mapper';

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
      mode: transaction.mode,
      transactionSource: transaction.transactionSource,
      transactionCategory: transaction.transactionCategory,
      currency: transaction.currency,
    } as TransactionResponse;
  });
  return Response.json(transactionResponse);
};

export const POST = async (request: NextRequest): Promise<Response> => {
  try {
    const transactionRequest: AddTransactionRequest = await request.json();
    const addedTransactions = await addTransaction(transactionRequest);
    const transactionDtos: TransactionResponse[] = addedTransactions
      .sort(
        (transaction1: Transaction, transaction2: Transaction) =>
          transaction2.date.getTime() - transaction1.date.getTime()
      )
      .map((transaction) => toTransactionResponse(transaction));
    return Response.json(transactionDtos, {
      status: 201,
      statusText: 'Transaction created',
    });
  } catch (error) {
    return new Response('Error adding transaction', { status: 500 });
  }
};
