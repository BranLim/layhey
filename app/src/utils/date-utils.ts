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

export const toDate = (formattedDate: string, dateFormat: string): Date => {
  return parse(formattedDate, dateFormat, new Date());
};

export const toFormattedDate = (date: Date, dateFormat: string): string => {
  return format(date, dateFormat);
};

export const toTransactionPeriodFormat = (date: Date) => {
  if (!date) {
    return '';
  }
  const temp = setMonth(new Date(), date.getUTCMonth());
  return `${date.getUTCFullYear()}-${format(temp, 'MM')}`;
};

export const switchDateFormat = (
  formattedDate: string,
  originalFormat: string,
  newFormat: string
) => {
  const convertedDate = toDate(formattedDate, originalFormat);
  if (isNaN(convertedDate.getTime())) {
    console.log(
      `Error Converting date ${formattedDate} from ${originalFormat} to ${newFormat} `
    );
    return formattedDate;
    //throw new Error(`Invalid  date ${formattedDate}`);
  }
  return toFormattedDate(convertedDate, newFormat);
};
