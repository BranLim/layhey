import { Transaction } from '@/types/Transaction';
import { connectMongo } from '@/database/mongodb';
import {
  TransactionDocument,
  TransactionModel,
} from '@/lib/models/transaction.model';
import { toTransaction } from '@/lib/mappers/transaction.mapper';

const add = async (transaction: Transaction): Promise<Transaction> => {
  await connectMongo();

  const transactionDocument: Partial<TransactionDocument> = {
    date: transaction.date,
    amount: transaction.amount,
    currency: transaction.currency,
    mode: transaction.mode,
    transactionSource: transaction.transactionSource,
    transactionCategory: transaction.transactionCategory,
  };
  const newTransaction = new TransactionModel(transactionDocument);

  const addedTransaction: TransactionDocument = await newTransaction.save();

  return toTransaction(addedTransaction);
};

const addAll = async (transactions: Transaction[]): Promise<Transaction[]> => {
  await connectMongo();

  const transactionDocuments: TransactionDocument[] = [];
  transactions.forEach((transaction) => {
    const newTransaction = new TransactionModel({
      date: transaction.date,
      amount: transaction.amount,
      currency: transaction.currency,
      mode: transaction.mode,
      transactionSource: transaction.transactionSource,
      transactionCategory: transaction.transactionCategory,
    } as TransactionDocument);
    transactionDocuments.push(newTransaction);
  });

  const addedTransactions =
    await TransactionModel.insertMany(transactionDocuments);

  if (!addedTransactions) {
    return [] as Transaction[];
  }

  return addedTransactions.map((newTransaction: TransactionDocument) =>
    toTransaction(newTransaction)
  );
};

const update = async (
  id: string,
  transaction: Transaction
): Promise<Transaction | null> => {
  const updatedTransaction = await TransactionModel.findByIdAndUpdate(
    id,
    {
      date: transaction.date,
      amount: transaction.amount,
      currency: transaction.currency,
      mode: transaction.mode,
      transactionSource: transaction.transactionSource,
      transactionCategory: transaction.transactionCategory,
    },
    { new: true }
  );

  if (!updatedTransaction) {
    throw new Error(`Error updating Transaction with Id ${id}.`);
  }

  return toTransaction(updatedTransaction);
};

const findAllMatching = async (
  startPeriod: string,
  endPeriod: string
): Promise<Transaction[]> => {
  await connectMongo();

  const foundTransactions = await TransactionModel.find({
    date: {
      $gte: new Date(startPeriod),
      $lte: new Date(endPeriod),
    },
  });

  if (!foundTransactions) {
    return [] as Transaction[];
  }

  return foundTransactions.map(
    (transaction: TransactionDocument) =>
      ({
        id: transaction._id,
        mode: transaction.mode,
        transactionSource: transaction.transactionSource,
        transactionCategory: transaction.transactionCategory,
        amount: transaction.amount,
        currency: transaction.currency,
        date: transaction.date,
      }) as Transaction
  );
};

const findOneById = async (id: string): Promise<Transaction | null> => {
  await connectMongo();

  const foundTransaction = await TransactionModel.findById(id);
  if (!foundTransaction) {
    return null;
  }

  const transaction: Transaction = {
    id: foundTransaction._id,
    mode: foundTransaction.mode,
    transactionSource: foundTransaction.transactionSource,
    transactionCategory: foundTransaction.transactionCategory,
    amount: foundTransaction.amount,
    currency: foundTransaction.currency,
    date: foundTransaction.date,
  };

  return transaction;
};

export { findAllMatching, findOneById, add, addAll, update };
