import {
  addDays,
  endOfMonth,
  format,
  isDate,
  parse,
  parseISO,
  startOfWeek,
} from 'date-fns';

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

export const fromAccountingMonthToDate = (formattedDate: string): Date => {
  const [year, month] = formattedDate.split('-').map(Number);
  return new Date(year, month - 1);
};

export const toFormattedDate = (date: Date, dateFormat: string): string => {
  if (!date) {
    return '';
  }
  let formattedDate = '';
  try {
    formattedDate = format(date, dateFormat);
  } catch (error) {}

  return formattedDate;
};

export const toAccountingMonth = (date: Date) => {
  return `${date.getUTCFullYear()}-${format(date, 'MM')}`;
};

export const calculateNumberOfDays = (noOfDaysInMillis: number): number => {
  return noOfDaysInMillis / (1000 * 60 * 60 * 24);
};

export const ensureDate = (value: unknown): Date => {
  if (isDate(value)) {
    return value;
  }
  if (typeof value === 'string') {
    return parseISO(value);
  }
  throw new Error('Unknown value. Cannot convert to date/time');
};

export const getSunday = (currentDate: Date): Date => {
  const startOfWeekDate = startOfWeek(currentDate, { weekStartsOn: 1 });
  return addDays(startOfWeekDate, 6);
};

export const getMonthEnd = (currentDate: Date): Date => endOfMonth(currentDate);
