import { NextRequest } from 'next/server';
import { TransactionService } from '@/services/transaction-service';

export const dynamic = 'force-dynamic';

export const PUT = async (
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<Response> => {
  const id: string = params.id;
  const transactionRequest = await request.json();
  var transactionService = new TransactionService();
  await transactionService.updateTransaction(id, transactionRequest);
  return new Response();
};
