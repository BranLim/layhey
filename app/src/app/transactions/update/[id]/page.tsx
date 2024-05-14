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
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { closeModal } from '@/slices/modal-slice';

interface Props {
  params: {
    id: string;
  };
}

interface InputOption {
  recurring: boolean;
}

interface Input {
  id: string;
  type: string;
  source: string;
  category: string;
  amount: number;
  date: Date;
  currency: string;
  options: InputOption;
}

const getTransaction = async (id: string): Promise<TransactionDto> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/transactions/${id}`
  );
  if (response.ok) {
    return response.json();
  }
  return {} as TransactionDto;
};

const UpdateTransaction = ({ params }: Props) => {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<Input>();
  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      const transaction = await getTransaction(params.id);
      setValue('category', transaction.category);
      setValue('amount', transaction.amount);
      setValue('date', transaction.date);
      setValue('currency', transaction.currency);
      setValue('source', transaction.transactionSource);
    })();
  });

  const handleCloseModal = () => {
    dispatch(closeModal());
  };

  const onSubmit: SubmitHandler<Input> = async (data: Input) => {
    const newTransaction: TransactionDto = {
      ...getValues(),
      category: categoryFromValue(data.category),
      transactionSource: transactionTypeFromValue(data.source),
      transactionType: '',
      amount: data.amount,
      date: data.date,
      currency: 'SGD',
    };
    await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTransaction),
    });
  };

  return (
    <Box p={4} w={480}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={4}>
          <FormControl>
            <RadioGroup defaultValue='Income'>
              <HStack>
                <Radio value='Income'>Income</Radio>
                <Radio value='Expense'>Expense</Radio>
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

export default UpdateTransaction;
