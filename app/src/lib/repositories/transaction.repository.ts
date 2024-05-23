import { Transaction } from '@/types/Transaction';
import { connectMongo } from '@/database/mongodb';
import {
  TransactionDocument,
  TransactionModel,
} from '@/lib/models/transaction';
import { toTransaction } from '@/lib/mappers/transaction-mapper';

const add = async (transaction: Transaction): Promise<Transaction> => {
  await connectMongo();

  const newTransaction = new TransactionModel({
    date: transaction.date,
    amount: transaction.amount,
    currency: transaction.currency,
    category: transaction.category,
    transactionSource: transaction.transactionSource,
    transactionType: transaction.transactionType,
    budget: undefined,
  });
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
      category: transaction.category,
      transactionSource: transaction.transactionSource,
      transactionType: transaction.transactionType,
    });
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
      category: transaction.category,
      transactionSource: transaction.transactionSource,
      transactionType: transaction.transactionType,
      budget: undefined,
    },
    { new: true }
  );
  return updatedTransaction;
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
  }).sort({ date: -1 });

  if (!foundTransactions) {
    return [] as Transaction[];
  }

  return foundTransactions.map(
    (transaction: TransactionDocument) =>
      ({
        id: transaction._id,
        category: transaction.category,
        transactionSource: transaction.transactionSource,
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
  return {
    id: foundTransaction._id,
    category: foundTransaction.category,
    transactionSource: foundTransaction.transactionSource,
    amount: foundTransaction.amount,
    currency: foundTransaction.currency,
    date: foundTransaction.date,
  } as Transaction;
};

export { findAllMatching, findOneById, add, addAll, update };
