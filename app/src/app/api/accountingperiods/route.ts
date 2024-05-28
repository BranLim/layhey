import { NextRequest } from 'next/server';
import {
  addAccountingPeriod,
  getAccountingPeriods,
} from '@/lib/actions/accounting.action';
import { getErrorMessage } from '@/utils/error.utils';
import { GetUserAccountingPeriodsResponse } from '@/types/AccountingPeriod';
import { toGetUserAccountingPeriodsResponse } from '@/lib/mappers/accountingPeriod.mapper';

export const GET = async (request: NextRequest): Promise<Response> => {
  try {
    const accountingPeriods = await getAccountingPeriods();
    if (!accountingPeriods || accountingPeriods.length < 0) {
      return Response.json(
        {},
        {
          status: 204,
          headers: { 'content-type': 'application/json' },
        }
      );
    }
    const getUserAccountingPeriodResponse: GetUserAccountingPeriodsResponse =
      toGetUserAccountingPeriodsResponse(accountingPeriods);
    return Response.json(getUserAccountingPeriodResponse, {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  } catch (error) {
    console.log(`Error adding accounting period: ${getErrorMessage(error)}`);
    return new Response('Error adding accounting period', { status: 500 });
  }
};

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
