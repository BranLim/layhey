import { TransactionCategory } from '@/types/Transaction';
import { TransactionCategoryModel } from '@/lib/models/transaction.model';

const add = async (
  transactionCategory: TransactionCategory
): Promise<TransactionCategory> => {
  const newTransactionCategory = new TransactionCategoryModel({
    name: transactionCategory.name,
    description: transactionCategory.description,
  });

  const addedTransactionCategory = await newTransactionCategory.save();

  return {
    id: newTransactionCategory._id,
    name: newTransactionCategory.name,
    description: newTransactionCategory.description,
  };
};
