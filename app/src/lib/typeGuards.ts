import { TransactionMode, TransactionSource } from '@/types/Transaction';

const isString = (value: any): value is string => typeof value === 'string';

const isNumber = (value: any): value is number => typeof value === 'number';

const isDate = (value: any): value is Date =>
  value instanceof Date && !isNaN(value.getTime());

const isTransactionSource = (value: any): value is TransactionSource =>
  Object.values(TransactionSource).includes(value);

const isTransactionMode = (value: any): value is TransactionMode =>
  Object.values(TransactionMode).includes(value);

export { isString, isNumber, isDate, isTransactionSource, isTransactionMode };
