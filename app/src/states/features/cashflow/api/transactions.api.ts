import { TransactionResponse } from '@/types/Transaction';
import { toFormattedDate } from '@/utils/date.utils';

export const getTransactions = async (
  startPeriod: string,
  endPeriod: string
): Promise<TransactionResponse[]> => {
  const formattedStartPeriod = toFormattedDate(
    new Date(startPeriod),
    'yyyy-MM-dd'
  );
  const formattedEndPeriod = toFormattedDate(new Date(endPeriod), 'yyyy-MM-dd');

  const apiPath = `${process.env.NEXT_PUBLIC_SERVER_URL}/api/transactions?startPeriod=${formattedStartPeriod}&endPeriod=${formattedEndPeriod}`;
  const response = await fetch(apiPath, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    },
  });
  if (!response.ok) {
    throw new Error(
      `Error get transactions for the period: ${startPeriod} - ${endPeriod}`
    );
  }

  return (await response.json()) as TransactionResponse[];
};
