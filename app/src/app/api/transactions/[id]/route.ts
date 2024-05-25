import { NextRequest } from 'next/server';
import {
  getTransaction,
  updateTransaction,
} from '@/lib/actions/transaction.action';

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
  await updateTransaction(id, transactionRequest);
  return new Response();
};
