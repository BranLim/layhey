import { parse, format } from 'date-fns';

export const toDate = (period: string, dateFormat: string): Date => {
  return parse(period, dateFormat, new Date());
};

export const toPeriod = (date: Date, dateFormat: string): string => {
  return format(date, dateFormat);
};
