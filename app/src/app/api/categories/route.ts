import { NextRequest } from 'next/server';
import { getTransactionCategories } from '@/lib/actions/transactionCategories.action';
import {
  TransactionCategoriesResponse,
  TransactionCategoryDto,
} from '@/types/Transaction';

export const dynamic = 'force-dynamic';

export const GET = async (request: NextRequest): Promise<Response> => {
  try {
    const transactionCategories = await getTransactionCategories();

    if (transactionCategories.length == 0) {
      return Response.json(
        {},
        {
          status: 202,
          statusText: 'No Categories',
        }
      );
    }
    const transactionCategoriesDtos: TransactionCategoryDto[] =
      transactionCategories.map((category) => ({
        id: category.id,
        name: category.name,
        description: category.description,
      }));

    const transactionCategoriesResponse: TransactionCategoriesResponse = {
      categories: transactionCategoriesDtos,
    };
    return Response.json(transactionCategoriesResponse, {
      status: 200,
      statusText: 'Found categories',
    });
  } catch (error) {
    return Response.json(
      {},
      {
        status: 500,
        statusText: 'Error getting transaction categories',
      }
    );
  }
};
