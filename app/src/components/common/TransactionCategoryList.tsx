'use client';
import React, { useEffect, useState } from 'react';
import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Radio,
  RadioGroup,
  Tooltip,
} from '@chakra-ui/react';
import {
  TransactionCategoriesResponse,
  TransactionCategoryDto,
} from '@/types/Transaction';
import { UseFormRegister } from 'react-hook-form';

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
      {transactionCategories.length > 0 ? (
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
              {transactionCategories.map((category) => (
                <Tooltip openDelay={500} key={category.id}>
                  <Radio {...register('category')} value={category.name}>
                    {category.name}
                  </Radio>
                </Tooltip>
              ))}
            </HStack>
          </RadioGroup>
        </FormControl>
      ) : (
        <Button colorScheme='blue'>Add</Button>
      )}
    </>
  );
};
