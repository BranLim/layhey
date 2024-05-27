import { NextRequest } from 'next/server';
import { addAccountingPeriod } from '@/lib/actions/accounting.action';
import { getErrorMessage } from '@/utils/error.utils';

export const POST = async (request: NextRequest): Promise<Response> => {
  try {
    const accountingPeriodRequest = await request.json();
    const addedAccountingPeriod = await addAccountingPeriod(
      accountingPeriodRequest
    );
    return Response.json(addedAccountingPeriod, {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  } catch (error) {
    console.log(`Error adding accounting period: ${getErrorMessage(error)}`);
    return new Response('Error adding accounting period', { status: 500 });
  }
};
