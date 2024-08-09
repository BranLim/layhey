import { TransactionCategory } from '@/types/Transaction';
import { TransactionCategoryModel } from '@/lib/models/transaction.model';
import { connectMongo } from '@/database/mongodb';

const add = async (
  transactionCategory: TransactionCategory
): Promise<TransactionCategory> => {
  await connectMongo();

  const newTransactionCategory = new TransactionCategoryModel({
    name: transactionCategory.name,
    description: transactionCategory.description,
  });

  const addedTransactionCategory = await newTransactionCategory.save();

  return {
    id: addedTransactionCategory._id as string,
    name: addedTransactionCategory.name,
    description: addedTransactionCategory.description,
  };
};

const getCategories = async (): Promise<TransactionCategory[]> => {
  await connectMongo();

  const transactionCategories = await TransactionCategoryModel.find({}).sort({
    name: -1,
  });
  return transactionCategories.map(
    (category) =>
      ({
        id: category._id,
        name: category.name,
        description: category.description,
      }) as TransactionCategory
  );
};

export { add, getCategories };
