'use client';

import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  NumberInput,
  NumberInputField,
  Select,
  Spacer,
  Stack,
} from '@chakra-ui/react';
import { SubmitHandler, useForm } from 'react-hook-form';
import add from '@/actions/transactions';
import { Transaction } from '@/types/Transaction';

interface Input {
  amount: number;
  category: string;
  date: Date;
}

export default function AddTransaction() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Input>();

  const onSubmit: SubmitHandler<Input> = async (data) => {
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
          <FormControl isRequired isInvalid={!!errors.amount}>
            <FormLabel htmlFor='transactionAmount'>Amount</FormLabel>
            <NumberInput
              id='transactionAmount'
              {...register('amount', {
                required: true,
                maxLength: { value: 50, message: '' },
                valueAsNumber: true,
              })}
            >
              <NumberInputField />
            </NumberInput>
          </FormControl>
          <FormControl>
            <FormLabel htmlFor='transactionCategory'>Category</FormLabel>
            <Select
              id='transactionCategory'
              placeholder='Transaction Category'
              {...register('category', { required: true })}
            >
              <option>Income</option>
              <option>Expense</option>
            </Select>
          </FormControl>
          <FormControl>
            <FormLabel htmlFor='transactionDate'>Date</FormLabel>
            <Input id='transactionDate' type='date' />
          </FormControl>
          <Flex alignItems='right'>
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
