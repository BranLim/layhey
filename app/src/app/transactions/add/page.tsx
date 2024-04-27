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
import add from '@/actions/transactions';
import { Transaction } from '@/types/Transaction';
import { NumericFormat } from 'react-number-format';
import { useState } from 'react';

interface InputOption {
  recurring: boolean;
}

interface Input {
  amount: number;
  category: string;
  date: Date;
  currency: string;
  options: InputOption;
}

export default function AddTransaction() {
  const {
    register,
    handleSubmit,

    control,
    formState: { errors },
  } = useForm<Input>();
  const [amount, setAmount] = useState(0);

  const onSubmit: SubmitHandler<Input> = async (data: Input) => {
    console.log(data);
    const newTransaction: Transaction = {
      amount: data.amount,
      category: data.category,
      date: data.date,
      currency: 'SGD',
    };
    await add(newTransaction);
  };

  return (
    <Box p={4} w={480}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={4}>
          <FormControl>
            <FormLabel htmlFor='category'>Category</FormLabel>
            <Select
              id='category'
              placeholder='Transaction Category'
              {...register('category', { required: true })}
            >
              <option>Income</option>
              <option>Expense</option>
            </Select>
          </FormControl>
          <FormControl isRequired isInvalid={!!errors.amount}>
            <FormLabel htmlFor='amount'>Amount</FormLabel>
            <Controller
              control={control}
              {...register('amount', {
                required: 'Transaction amount is required',
              })}
              render={({ field: { onChange, name, value } }) => (
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
          <FormControl mt={2}>
            <Checkbox {...register('options.recurring')}>Recurring</Checkbox>
          </FormControl>
          <Flex alignItems='right' mt={4}>
            <Spacer />
            <Button mt={4} mr={2} type='submit' colorScheme='green'>
              Add
            </Button>
            <Button mt={4} mr={2} colorScheme='red'>
              Cancel
            </Button>
          </Flex>
        </Stack>
      </form>
    </Box>
  );
}
