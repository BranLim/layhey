import { TransactionDocument } from '@/lib/models/transaction';
import { Transaction } from '@/types/Transaction';

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

export { toTransaction };
