'use client';

import {
  Box,
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Select,
  Spacer,
  Stack,
} from '@chakra-ui/react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import {
  categoryFromValue,
  ExpenseType,
  IncomeType,
  TransactionCategory,
  TransactionDto,
  transactionTypeFromValue,
} from '@/types/Transaction';
import { NumericFormat } from 'react-number-format';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { closeModal } from '@/slices/modal-slice';
import { addTransaction } from '@/slices/transaction-slice';

interface InputOption {
  recurring: boolean;
}

interface Input {
  type: string;
  category: string;
  amount: number;
  date: Date;
  currency: string;
  options: InputOption;
}

const AddTransaction = () => {
  const {
    register,
    handleSubmit,

    control,
    formState: { errors },
  } = useForm<Input>();
  const dispatch = useDispatch();

  const handleCloseModal = () => {
    dispatch(closeModal());
  };

  const onSubmit: SubmitHandler<Input> = async (data: Input) => {
    console.log(data);
    const newTransaction: TransactionDto = {
      id: '',
      category: categoryFromValue(data.category),
      transactionType: transactionTypeFromValue(data.type),
      amount: data.amount,
      date: data.date,
      currency: 'SGD',
    };
    const apiPath = `${process.env.NEXT_PUBLIC_SERVER_URL}/api/transactions`;
    console.log(apiPath);
    await fetch(apiPath, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTransaction),
    });
    dispatch(addTransaction(newTransaction));
    dispatch(closeModal());
  };

  return (
    <Box p={4} w={480}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={4}>
          <FormControl isRequired isInvalid={!!errors.amount}>
            <FormLabel htmlFor='amount'>Amount</FormLabel>
            <Controller
              control={control}
              name='amount'
              rules={{ required: 'Transaction amount is required' }}
              render={({ field: { onChange, value } }) => (
                <Input
                  as={NumericFormat}
                  thousandSeparator=','
                  decimalSeparator='.'
                  max={50}
                  value={value}
                  onValueChange={(values: any) => {
                    const { floatValue } = values;
                    onChange(floatValue);
                  }}
                />
              )}
            />
          </FormControl>
          <FormControl>
            <FormLabel htmlFor='date'>Date</FormLabel>
            <Input
              id='date'
              type='date'
              {...register('date', { required: true })}
            />
          </FormControl>
          <FormControl>
            <FormLabel htmlFor='category'>Category</FormLabel>
            <Select
              id='category'
              placeholder='Transaction Category'
              {...register('category', { required: true })}
            >
              {Object.values(TransactionCategory).map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </Select>
          </FormControl>
          <FormControl>
            <FormLabel htmlFor='transactionType'>Transaction Type</FormLabel>
            <Select
              id='transactionType'
              placeholder='Transaction Type'
              {...register('type', { required: true })}
            >
              {[
                ...Object.values(IncomeType),
                ...Object.values(ExpenseType),
              ].map((transactionType) => (
                <option key={transactionType} value={transactionType}>
                  {transactionType}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl mt={2}>
            <Checkbox {...register('options.recurring')}>Recurring</Checkbox>
          </FormControl>
          <Flex alignItems='right' mt={4}>
            <Spacer />
            <Button mt={4} mr={2} type='submit' colorScheme='blue'>
              Add
            </Button>
            <Button
              mt={4}
              mr={2}
              colorScheme='gray'
              onClick={() => handleCloseModal()}
            >
              Cancel
            </Button>
          </Flex>
        </Stack>
      </form>
    </Box>
  );
};

export default AddTransaction;
