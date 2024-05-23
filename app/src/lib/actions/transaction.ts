'use server';

import {
  AddTransactionRequest,
  Transaction,
  TransactionDto,
} from '@/types/Transaction';
import {
  add,
  addAll,
  findAllMatching,
  findOneById,
  update,
} from '@/lib/repositories/transaction-repository';
import { splitTransaction } from '@/lib/helpers/transaction.helper';

const addTransaction = async (
  addTransactionRequest: AddTransactionRequest
): Promise<Transaction[]> => {
  try {
    const transactionsAdded: Transaction[] = [];

    const { transaction, hasAdvancedSetting, advancedSetting } =
      addTransactionRequest;

    if (hasAdvancedSetting) {
      const option = advancedSetting?.option;
      if (option && option.type == 'split') {
        const splitTransactions: Transaction[] = splitTransaction(
          transaction,
          option
        );
        const addedTransactions: Transaction[] =
          await addAll(splitTransactions);
        transactionsAdded.push(...addedTransactions);
      }
    } else {
      const transactionToAdd: Transaction = {
        ...transaction,
        date: new Date(transaction.date),
        createdOn: undefined,
        lastModifiedOn: undefined,
      };
      const newTransaction = await add(transactionToAdd);
      transactionsAdded.push(newTransaction);
    }

    return transactionsAdded;
  } catch (error) {
    console.log('Error adding transaction');
    throw error;
  }
};

const updateTransaction = async (
  id: string,
  transaction: TransactionDto
): Promise<Transaction | null> => {
  try {
    const updatedTransaction = await update(id, {
      ...transaction,
    });
    if (!updatedTransaction) {
      console.log('No transaction found with id ', id);
      return null;
    }
    return updatedTransaction;
  } catch (error) {
    console.log('Error updating transaction with id ', id);
    throw error;
  }
};

const getTransactions = async (
  startPeriod: string,
  endPeriod: string
): Promise<Transaction[]> => {
  const transactions: Transaction[] = await findAllMatching(
    startPeriod,
    endPeriod
  );
  return transactions;
};

const getTransaction = async (id: string): Promise<TransactionDto | null> => {
  const transaction = await findOneById(id);
  if (!transaction) {
    console.log('No transaction found with id ', id);
    return null;
  }
  return {
    id: transaction.id,
    category: transaction.category,
    transactionType: transaction.transactionType,
    amount: transaction.amount,
    currency: transaction.currency,
    date: transaction.date,
  } as TransactionDto;
};

export { addTransaction, updateTransaction, getTransactions, getTransaction };
