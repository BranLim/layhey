'use client';
import React, { useEffect, useState } from 'react';
import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  IconButton,
  Radio,
  RadioGroup,
  Tooltip,
} from '@chakra-ui/react';
import {
  TransactionCategoriesResponse,
  TransactionCategoryDto,
} from '@/types/Transaction';
import { UseFormRegister } from 'react-hook-form';
import { AddIcon } from '@chakra-ui/icons';
import { Visibility } from '@chakra-ui/media-query/dist/visibility';

type Props = {
  register: UseFormRegister<any>;
};

export const TransactionCategoryList = ({ register }: Props) => {
  const [isLoadedCategory, setIsLoadedCategory] = useState(false);
  const [transactionCategories, setTransactionCategories] = useState<
    TransactionCategoryDto[]
  >([]);

  useEffect(() => {
    if (!isLoadedCategory) {
      (async () => {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/api/transactions/categories`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          }
        );
        if (response && response.ok) {
          const transactionCategoriesResponse =
            (await response.json()) as TransactionCategoriesResponse;
          const transactionCategories =
            transactionCategoriesResponse.categories?.map((category) => ({
              id: category.id,
              name: category.name,
              description: category.description,
            })) ?? [];
          setTransactionCategories(transactionCategories);
        }
      })();
      setIsLoadedCategory((state) => !state);
    }
  }, [isLoadedCategory]);
  return (
    <>
      <FormControl>
        <FormLabel htmlFor='transactionCategories'>Category</FormLabel>
        <RadioGroup id='transactionCategories'>
          <HStack
            columnGap={4}
            rowGap={2}
            wrap={'wrap'}
            height='80px'
            alignItems='start'
            overflow='auto'
          >
            {transactionCategories.length > 0 &&
              transactionCategories.map((category) => (
                <Radio
                  key={category.id}
                  {...register('category')}
                  value={category.name}
                >
                  {category.name}
                </Radio>
              ))}
          </HStack>
        </RadioGroup>
      </FormControl>
    </>
  );
};
