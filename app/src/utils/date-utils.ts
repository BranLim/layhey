import { format, parse, setMonth } from 'date-fns';

export const isTransactionDateWithin = (
  transactionDate: Date,
  budgetStartPeriod: Date,
  budgetEndPeriod: Date
): boolean => {
  if (transactionDate) {
    const transactionDateInMillis = transactionDate.getTime();
    return (
      transactionDateInMillis >= budgetStartPeriod.getTime() &&
      transactionDateInMillis <= budgetEndPeriod.getTime()
    );
  }
  return false;
};

export const getCurrentYear = () => {
  return new Date().getUTCFullYear();
};

export const getCurrentDate = (): Date => {
  return new Date();
};

export const fromTransactionPeriodToDate = (formattedDate: string): Date => {
  const [year, month] = formattedDate.split('-').map(Number);
  return new Date(year, month - 1);
};

export const toFormattedDate = (date: Date, dateFormat: string): string => {
  return format(date, dateFormat);
};

export const toTransactionMonth = (date: Date) => {
  return `${date.getUTCFullYear()}-${format(date, 'MM')}`;
};
