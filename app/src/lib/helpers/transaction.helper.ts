import { Interval, Option } from '@/types/AdvancedSetting';
import { Transaction, TransactionRequest } from '@/types/Transaction';
import { add, Duration } from 'date-fns';

const getAddDateDuration = (interval: Interval) => {
  const duration: Duration = {};
  switch (interval) {
    case 'daily':
      duration.days = 1;
      break;
    case 'weekly':
      duration.weeks = 1;
      break;
    case 'monthly':
      duration.months = 1;
      break;
    case 'yearly':
      duration.years = 1;
      break;
  }
  return duration;
};

const generateSubsequentDates = (
  transactionDate: Date,
  frequency: number,
  interval: Interval,
  inclusive: boolean
): Date[] => {
  const nextDates: Date[] = [];
  const duration = getAddDateDuration(interval);

  let nextDate: Date = new Date(transactionDate.getTime());
  let i = inclusive ? 1 : 0;
  for (; i < frequency; i++) {
    nextDate = add(nextDate, duration);
    nextDates.push(nextDate);
  }

  return nextDates;
};

const splitTransaction = (
  transaction: TransactionRequest,
  option: Option
): Transaction[] => {
  if (!option || option.type !== 'split') {
    throw new Error('Invalid option parameter');
  }
  const transactions: Transaction[] = [];

  const { frequency, interval } = option;
  if (!interval) {
    throw new Error('Option props cannot be undefined');
  }
  const dates = generateSubsequentDates(
    new Date(transaction.date),
    frequency,
    interval,
    true
  );

  const averageTransactionAmount = transaction.amount / (dates.length + 1.0);
  transactions.push({
    ...transaction,
    date: new Date(transaction.date),
    amount: averageTransactionAmount,
  } as Transaction);

  for (const date of dates) {
    transactions.push({
      ...transaction,
      date: date,
      amount: averageTransactionAmount,
    } as Transaction);
  }

  return transactions;
};

const repeatTransaction = (transaction: TransactionRequest, option: Option) => {
  if (!option || option.type !== 'repeat') {
    throw new Error('Invalid option parameter');
  }
  const transactions: Transaction[] = [];

  const { frequency, interval } = option;
  if (!interval) {
    throw new Error('Option props cannot be undefined');
  }
  const dates = generateSubsequentDates(
    new Date(transaction.date),
    frequency,
    interval,
    false
  );

  transactions.push({
    ...transaction,
    date: new Date(transaction.date),
  } as Transaction);

  for (const date of dates) {
    transactions.push({
      ...transaction,
      date: date,
    } as Transaction);
  }

  return transactions;
};

export { splitTransaction, repeatTransaction };
