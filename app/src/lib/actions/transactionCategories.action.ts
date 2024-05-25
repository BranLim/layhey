import { TransactionCategory } from '@/types/Transaction';
import { getCategories } from '@/lib/repositories/transactionCategory.repository';
import { getErrorMessage } from '@/utils/error.utils';

const getTransactionCategories = async (): Promise<TransactionCategory[]> => {
  try {
    const transactionCategories = await getCategories();
    if (transactionCategories && transactionCategories.length > 0) {
      console.log(
        `Found ${transactionCategories.length} transaction categories`
      );
    } else {
      console.log(`No transaction categories found.`);
    }
    return transactionCategories;
  } catch (error) {
    console.log(`Error getting categories: ${getErrorMessage(error)}`);
    throw error;
  }
};

export { getTransactionCategories };
