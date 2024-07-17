'use server';

import {
  AddTransactionRequest,
  modeFromValue,
  Transaction,
  TransactionDto,
  transactionSourceFromValue,
} from '@/types/Transaction';
import {
  add,
  addAll,
  findAllMatching,
  findOneById,
  update,
} from '@/lib/repositories/transaction.repository';
import {
  repeatTransaction,
  splitTransaction,
} from '@/lib/helpers/transaction.helper';

const addTransaction = async (
  addTransactionRequest: AddTransactionRequest
): Promise<Transaction[]> => {
  try {
    const transactionsAdded: Transaction[] = [];

    const { transaction, hasAdvancedSetting, advancedSetting } =
      addTransactionRequest;

    const option = advancedSetting?.option;
    if (hasAdvancedSetting && option) {
      let transactionsToInsert: Transaction[];
      switch (option.type) {
        case 'split':
          transactionsToInsert = splitTransaction(transaction, option);
          break;
        case 'repeat':
          transactionsToInsert = repeatTransaction(transaction, option);
          break;
      }
      const addedTransactions: Transaction[] =
        await addAll(transactionsToInsert);
      transactionsAdded.push(...addedTransactions);
    } else {
      const transactionToAdd: Transaction = {
        ...transaction,
        transactionSource: transactionSourceFromValue(
          transaction.transactionSource
        ),
        mode: modeFromValue(transaction.mode),
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
  endPeriod: string,
  transactionType?: string
): Promise<Transaction[]> => {
  const transactions: Transaction[] = await findAllMatching(
    startPeriod,
    endPeriod,
    transactionType
  );
  return transactions;
};

const getTransaction = async (id: string): Promise<TransactionDto | null> => {
  const transaction = await findOneById(id);
  if (!transaction) {
    console.log('No transaction found with id ', id);
    return null;
  }
  const transactionDto: TransactionDto = {
    id: transaction.id,
    mode: transaction.mode,
    transactionCategory: transaction.transactionCategory,
    transactionSource: transaction.transactionSource,
    amount: transaction.amount,
    currency: transaction.currency,
    date: transaction.date,
  };
  return transactionDto;
};

export { addTransaction, updateTransaction, getTransactions, getTransaction };
