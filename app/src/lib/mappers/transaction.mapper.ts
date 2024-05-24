import { TransactionDocument } from '@/lib/models/transaction.model';
import { Transaction, TransactionResponse } from '@/types/Transaction';

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

export { toTransaction, toTransactionResponse };
