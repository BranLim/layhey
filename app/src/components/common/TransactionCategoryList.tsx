'use client';
import React, { useEffect, useState } from 'react';
import {
  FormControl,
  FormLabel,
  HStack,
  Radio,
  RadioGroup,
} from '@chakra-ui/react';
import {
  TransactionCategoriesResponse,
  TransactionCategoryDto,
} from '@/types/Transaction';
import { Control, Controller, UseFormRegister } from 'react-hook-form';
import { FormInput } from '@/app/transactions/update/[id]/page';

type Props = {
  control: Control<FormInput>;
};

export const TransactionCategoryList = ({ control }: Props) => {
  const [isLoadedCategory, setIsLoadedCategory] = useState(false);
  const [transactionCategories, setTransactionCategories] = useState<
    TransactionCategoryDto[]
  >([]);

  useEffect(() => {
    if (!isLoadedCategory) {
      (async () => {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/api/categories`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          }
        );
        if (response && response.ok) {
          const transactionCategoriesResponse =
            (await response.json()) as TransactionCategoriesResponse;
          const transactionCategories =
            transactionCategoriesResponse.categories
              ?.map((category) => ({
                id: category.id,
                name: category.name,
                description: category.description,
              }))
              .sort((category1, category2) => {
                return category1.name.localeCompare(category2.name);
              }) ?? [];
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
        <Controller
          control={control}
          name='category'
          render={({ field }) => (
            <RadioGroup {...field}>
              <HStack
                columnGap={4}
                rowGap={2}
                wrap={'wrap'}
                height='100px'
                alignItems='start'
                overflow='auto'
              >
                {transactionCategories.length > 0 &&
                  transactionCategories.map((category) => (
                    <Radio key={category.id} value={category.name}>
                      {category.name}
                    </Radio>
                  ))}
              </HStack>
            </RadioGroup>
          )}
        />
      </FormControl>
    </>
  );
};
