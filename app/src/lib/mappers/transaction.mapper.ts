import { TransactionDocument } from '@/lib/models/transaction.model';
import {
  Transaction,
  TransactionDto,
  TransactionResponse,
} from '@/types/Transaction';
import {
  isNumber,
  isString,
  isTransactionMode,
  isTransactionSource,
} from '@/lib/typeGuards';

const toTransaction = (
  transactionDocument: TransactionDocument
): Transaction => {
  return {
    id: transactionDocument._id,
    date: transactionDocument.date,
    amount: transactionDocument.amount,
    currency: transactionDocument.currency,
    mode: transactionDocument.mode,
    transactionSource: transactionDocument.transactionSource,
    transactionCategory: transactionDocument.transactionCategory,
    createdOn: transactionDocument.createdOn,
    lastModifiedOn: transactionDocument.lastModifiedOn,
  } as Transaction;
};

const toTransactionResponse = (
  transaction: Transaction
): TransactionResponse => {
  return {
    id: transaction.id,
    date: transaction.date.toISOString(),
    amount: transaction.amount,
    currency: transaction.currency,
    mode: transaction.mode,
    transactionSource: transaction.transactionSource,
    transactionCategory: transaction.transactionCategory,
    createdOn: transaction.createdOn?.toISOString(),
    lastModifiedOn: transaction.lastModifiedOn?.toISOString() ?? '',
  } as TransactionResponse;
};

const mapJsonToTransactionDto = (apiResponse: any): TransactionDto | null => {
  if (!apiResponse) {
    return null;
  }
  if (
    isString(apiResponse.id) &&
    isTransactionSource(apiResponse.transactionSource) &&
    isString(apiResponse.transactionCategory) &&
    isTransactionMode(apiResponse.mode) &&
    isNumber(apiResponse.amount) &&
    isString(apiResponse.currency) &&
    isString(apiResponse.date) &&
    (apiResponse.createdOn === undefined || isString(apiResponse.createdOn)) &&
    (apiResponse.lastModifiedOn === undefined ||
      isString(apiResponse.lastModifiedOn))
  ) {
    return {
      id: apiResponse.id,
      amount: apiResponse.amount,
      mode: apiResponse.mode,
      transactionSource: apiResponse.transactionSource,
      transactionCategory: apiResponse.transactionCategory,
      date: new Date(apiResponse.date),
      currency: apiResponse.currency,
      createdOn: apiResponse.createdOn
        ? new Date(apiResponse.createdOn)
        : undefined,
      lastModifiedOn: apiResponse.lastModifiedOn
        ? new Date(apiResponse.lastModifiedOn)
        : undefined,
    } as TransactionDto;
  }
  return null;
};

export { toTransaction, toTransactionResponse, mapJsonToTransactionDto };
