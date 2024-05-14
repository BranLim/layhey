'use client';

import {
  Box,
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Radio,
  RadioGroup,
  Select,
  Spacer,
  Stack,
} from '@chakra-ui/react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import {
  categoryFromValue,
  TransactionCategory,
  TransactionDto,
  TransactionSource,
  transactionTypeFromValue,
} from '@/types/Transaction';
import { NumericFormat } from 'react-number-format';
import { closeModal } from '@/slices/modal-slice';
import { addTransaction } from '@/slices/transaction-slice';
import { useAppDispatch } from '@/lib/hooks';
import { getCurrentDate, toDate } from '@/utils/date-utils';

interface InputOption {
  recurring: boolean;
}

interface Input {
  category: string;
  date: string;
  source: string;
  type?: string;
  amount: number;
  currency: string;
  options: InputOption;
}

const today = getCurrentDate('yyyy-MM-dd');
const defaultFormValues: Input = {
  category: TransactionCategory.Income,
  date: today,
  source: '',
  type: '',
  amount: 0,
  currency: 'SGD',
  options: {
    recurring: false,
  },
};

const AddTransaction = () => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<Input>({ defaultValues: defaultFormValues });
  const dispatch = useAppDispatch();

  const handleCloseModal = () => {
    dispatch(closeModal());
  };

  const onSubmit: SubmitHandler<Input> = async (data: Input) => {
    console.log(`Form Data: ${data}`);
    const newTransaction: TransactionDto = {
      id: '',
      category: categoryFromValue(data.category),
      transactionSource: transactionTypeFromValue(data.source),
      transactionType: '',
      amount: data.amount,
      date: toDate(data.date, 'dd-MM-yyyy'),
      currency: 'SGD',
    };
    const apiPath = `${process.env.NEXT_PUBLIC_SERVER_URL}/api/transactions`;
    const response = await fetch(apiPath, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTransaction),
    });
    if (response.ok) {
      console.log('Transaction added. Updating state');
      dispatch(addTransaction(newTransaction));
      dispatch(closeModal());
    }
  };

  return (
    <Box p={4} w={480}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={4}>
          <FormControl>
            <RadioGroup defaultValue='Income'>
              <HStack>
                <Radio value='Income' {...register('category')}>
                  Income
                </Radio>
                <Radio value='Expense' {...register('category')}>
                  Expense
                </Radio>
              </HStack>
            </RadioGroup>
          </FormControl>
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
              {...register('date', { required: true, valueAsDate: false })}
            />
          </FormControl>
          <FormControl>
            <FormLabel htmlFor='transactionSource'>
              Transaction Source
            </FormLabel>
            <Select
              id='transactionSource'
              placeholder='Transaction Source'
              {...register('source', { required: false })}
            >
              {...Object.values(TransactionSource).map((transactionSource) => (
                <option key={transactionSource} value={transactionSource}>
                  {transactionSource}
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
