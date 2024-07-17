import {
  AddTransactionRequest,
  TransactionQueryParams,
  TransactionResponse,
} from '@/types/Transaction';
import { toFormattedDate } from '@/utils/date.utils';

export const getTransactions = async (
  transactionQueryParams: TransactionQueryParams
): Promise<TransactionResponse[]> => {
  let apiPath = `${process.env.NEXT_PUBLIC_SERVER_URL}/api/transactions?${new URLSearchParams(transactionQueryParams).toString()}`;
  if (transactionQueryParams.mode) {
    apiPath += `&type=${transactionQueryParams.mode}`;
  }
  const response = await fetch(apiPath, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    },
  });
  if (!response.ok) {
    throw new Error(
      `Error get transactions for the period: ${transactionQueryParams.startPeriod} - ${transactionQueryParams.endPeriod}`
    );
  }

  return (await response.json()) as TransactionResponse[];
};

export const addTransactions = async (
  newTransaction: AddTransactionRequest
) => {
  const apiPath = `${process.env.NEXT_PUBLIC_SERVER_URL}/api/transactions`;
  const response = await fetch(apiPath, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(newTransaction),
  });

  if (!response.ok) {
    throw new Error('Error adding new transaction');
  }
  return (await response.json()) as TransactionResponse[];
};
