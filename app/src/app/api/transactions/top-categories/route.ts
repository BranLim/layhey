import { NextRequest } from 'next/server';
import { getTransactions } from '@/lib/actions/transaction.action';
import { getCategorisedCashFlow } from '@/lib/actions/transactionCategories.action';

export const dynamic = 'force-dynamic';

export const GET = async (request: NextRequest): Promise<Response> => {
  const parameters = request.nextUrl.searchParams;
  const startPeriod = parameters.get('startPeriod') ?? '';
  const endPeriod = parameters.get('endPeriod') ?? '';
  const transactionMode = parameters.get('transactionMode') ?? '';
  const top = parameters.get('top') ?? '';

  const topCategoriesForPeriod = await getCategorisedCashFlow(
    startPeriod,
    endPeriod,
    parseInt(top),
    transactionMode
  );
  const transactions = await getTransactions(startPeriod, endPeriod);
  return Response.json({});
};
