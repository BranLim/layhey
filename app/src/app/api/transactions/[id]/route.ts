import { NextRequest } from 'next/server';
import {
  getTransaction,
  updateTransaction,
} from '@/lib/services/transaction.service';

export const dynamic = 'force-dynamic';

export const GET = async (
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<Response> => {
  const id = params.id;

  const transaction = await getTransaction(id);
  return Response.json(transaction, { status: 200 });
};

export const PUT = async (
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<Response> => {
  const id = params.id;
  const transactionRequest = await request.json();
  const updatedTransaction = await updateTransaction(id, transactionRequest);
  if (updatedTransaction) {
    return Response.json(updatedTransaction, {
      status: 200,
      statusText: 'Updated Transaction',
    });
  }
  return Response.json(
    {},
    { status: 500, statusText: `Error updating Transaction (${id})` }
  );
};
