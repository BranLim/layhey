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
  modeFromValue,
  TransactionMode,
  TransactionDto,
  TransactionSource,
  transactionSourceFromValue,
  UpdateTransactionRequest,
} from '@/types/Transaction';
import { NumericFormat } from 'react-number-format';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { closeModal } from '@/states/common/modal.slice';
import { AdvancedSetting } from '@/types/AdvancedSetting';
import { toFormattedDate } from '@/utils/date.utils';
import { TransactionCategoryList } from '@/components/common/TransactionCategoryList';
import { getOverallCashFlowSummary } from '@/states/features/cashflow/getOverallCashFlowSummary.thunk';
import { useAppDispatch, useAppSelector } from '@/states/hooks';
import { selectOverallCashFlowPeriod } from '@/states/features/cashflow/cashflow.slice';
import { updateTransaction } from '@/states/features/cashflow/updateTransaction.thunk';

interface Props {
  params: {
    id: string;
  };
}

export type FormInput = {
  mode: string;
  date: Date;
  source: string;
  category?: string;
  amount: number;
  currency: string;
};

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
  } = useForm<FormInput>();
  const dispatch = useAppDispatch();

  useEffect(() => {
    (async () => {
      const transaction = await getTransaction(params.id);
      setValue('mode', transaction.mode);
      setValue('amount', transaction.amount);
      setValue('date', transaction.date);
      setValue('currency', transaction.currency);
      setValue('source', transaction.transactionSource);
      setValue('category', transaction.transactionCategory);
    })();
  });

  const overallCashFlowPeriod = useAppSelector(selectOverallCashFlowPeriod);

  const handleCloseModal = () => {
    dispatch(closeModal('UpdateTransactionModal'));
  };

  const onSubmit: SubmitHandler<FormInput> = async (data: FormInput) => {
    const updateTransactionRequest: UpdateTransactionRequest = {
      transaction: {
        ...getValues(),
        id: params.id,
        mode: modeFromValue(data.mode),
        transactionSource: transactionSourceFromValue(data.source),
        transactionCategory: data.category ?? '',
        amount: data.amount,
        date: new Date(data.date).toISOString(),
        currency: 'SGD',
      },
    };

    dispatch(updateTransaction(updateTransactionRequest));
    dispatch(closeModal('UpdateTransactionModal'));
  };

  return (
    <Box p={4} w={480}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={4}>
          <FormControl>
            <RadioGroup defaultValue='Income'>
              <HStack>
                <Radio value='Income' {...register('mode')} isReadOnly={true}>
                  Income
                </Radio>
                <Radio value='Expense' {...register('mode')} isReadOnly={true}>
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
            <Controller
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id='date'
                  type='date'
                  value={toFormattedDate(getValues('date'), 'yyyy-MM-dd')}
                  onChange={(event) =>
                    field.onChange(new Date(event.target.value))
                  }
                />
              )}
              name='date'
            />
          </FormControl>
          <TransactionCategoryList control={control} />
          <FormControl>
            <FormLabel htmlFor='transactionSource'>Transaction Type</FormLabel>
            <Select
              id='transactionSource'
              placeholder='Transaction Type'
              {...register('source', { required: true })}
            >
              {...Object.values(TransactionSource).map((transactionSource) => (
                <option key={transactionSource} value={transactionSource}>
                  {transactionSource}
                </option>
              ))}
            </Select>
          </FormControl>

          <Flex alignItems='right' mt={4}>
            <Spacer />
            <Button mt={4} mr={2} type='submit' colorScheme='blue'>
              Update
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
