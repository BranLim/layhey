import { NextRequest } from 'next/server';
import { TransactionService } from '@/services/transaction-service';

export const dynamic = 'force-dynamic';

export const GET = async (
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<Response> => {
  const id = params.id;
  var transactionService = new TransactionService();
  const transaction = await transactionService.getTransaction(id);
  return Response.json(transaction, { status: 200 });
};

export const PUT = async (
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<Response> => {
  const id = params.id;
  const transactionRequest = await request.json();
  var transactionService = new TransactionService();
  await transactionService.updateTransaction(id, transactionRequest);
  return new Response();
};
