import { format, parse } from 'date-fns';

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

export const getCurrentDate = (dateFormat: string) => {
  return format(new Date(), dateFormat);
};

export const toDate = (formattedDate: string, dateFormat: string): Date => {
  return parse(formattedDate, dateFormat, new Date());
};

export const toFormattedDate = (date: Date, dateFormat: string): string => {
  return format(date, dateFormat);
};

export const switchDateFormat = (
  formattedDate: string,
  originalFormat: string,
  newFormat: string
) => {
  const convertedDate = toDate(formattedDate, originalFormat);
  if (isNaN(convertedDate.getTime())) {
    return 'Invalid  date';
  }
  return toFormattedDate(convertedDate, newFormat);
};
