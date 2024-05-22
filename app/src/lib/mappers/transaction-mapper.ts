import { TransactionDocument } from '@/lib/models/transaction';
import { Transaction, TransactionResponse } from '@/types/Transaction';

const toTransaction = (
  transactionDocument: TransactionDocument
): Transaction => {
  return {
    id: transactionDocument._id,
    date: transactionDocument.date,
    amount: transactionDocument.amount,
    currency: transactionDocument.currency,
    category: transactionDocument.category,
    transactionSource: transactionDocument.transactionSource,
    transactionType: transactionDocument.transactionType,
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
    category: transaction.category,
    transactionSource: transaction.transactionSource,
    transactionType: transaction.transactionType,
    createdOn: transaction.createdOn?.toISOString(),
    lastModifiedOn: transaction.lastModifiedOn?.toISOString() ?? '',
  } as TransactionResponse;
};

export { toTransaction, toTransactionResponse };
