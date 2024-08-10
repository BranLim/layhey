import {
  AddTransactionRequest,
  TransactionDto,
  TransactionQueryParams,
  TransactionResponse,
  UpdateTransactionRequest,
} from '@/types/Transaction';
import { mapJsonToTransactionDto } from '@/lib/mappers/transaction.mapper';

const getTransactionsApi = async (
  transactionQueryParams: TransactionQueryParams
): Promise<TransactionResponse[]> => {
  let apiPath = `${process.env.NEXT_PUBLIC_SERVER_URL}/api/transactions?${new URLSearchParams(transactionQueryParams).toString()}`;
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

  return await response.json();
};

const getTransactionByIdApi = async (
  id: string
): Promise<TransactionDto | null> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/transactions/${id}`
  );
  if (!response.ok) {
    return null;
  }
  return mapJsonToTransactionDto(await response.json());
};

const addTransactionsApi = async (
  newTransaction: AddTransactionRequest
): Promise<TransactionResponse[]> => {
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
  return await response.json();
};

const updateTransactionApi = async (
  transactionRequest: UpdateTransactionRequest
): Promise<TransactionResponse> => {
  const updateResponse = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/transactions/${transactionRequest.transaction.id}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transactionRequest.transaction),
    }
  );

  if (!updateResponse.ok) {
    throw new Error('Error updating transaction');
  }
  return await updateResponse.json();
};

export {
  getTransactionsApi,
  getTransactionByIdApi,
  addTransactionsApi,
  updateTransactionApi,
};
