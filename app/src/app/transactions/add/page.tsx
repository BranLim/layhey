'use client';

import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Input,
  InputGroup,
  InputRightAddon,
  InputRightElement,
  Radio,
  RadioGroup,
  Select,
  Spacer,
  Stack,
  Switch,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from '@chakra-ui/react';
import { Controller, SubmitHandler, useForm, useWatch } from 'react-hook-form';
import {
  AddTransactionRequest,
  categoryFromValue,
  TransactionCategory,
  TransactionSource,
  transactionTypeFromValue,
} from '@/types/Transaction';
import { NumericFormat } from 'react-number-format';
import { closeModal } from '@/states/common/modal-slice';
import { addTransaction } from '@/states/features/cashflow/cashflow-slice';
import { useAppDispatch } from '@/states/hooks';
import { getCurrentDate, toFormattedDate } from '@/utils/date-utils';
import { RepeatRule, Rule, SplitRule } from '@/types/Rule';

type AdditionalRules = {
  rule?: Rule;
};

type FormData = {
  category: string;
  date: Date;
  source: string;
  type?: string;
  amount: number;
  currency: string;
  hasAdditionalRules?: boolean;
  additionalRules: AdditionalRules;
};

const defaultFormValues: FormData = {
  category: TransactionCategory.Income,
  date: getCurrentDate(),
  source: '',
  type: '',
  amount: 0,
  currency: 'SGD',
  hasAdditionalRules: false,
  additionalRules: {},
};

const AddTransaction = () => {
  const dispatch = useAppDispatch();
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    control,
    formState: { errors },
  } = useForm<FormData>({ defaultValues: defaultFormValues });

  const hasAdditionalRules = useWatch({
    control,
    name: 'hasAdditionalRules',
    defaultValue: false,
  });

  const handleCloseModal = () => {
    dispatch(closeModal());
  };

  const onSubmit: SubmitHandler<FormData> = async (data: FormData) => {
    console.log(`Form Data: ${JSON.stringify(data)}`);
    const newTransaction: AddTransactionRequest = {
      transaction: {
        id: '',
        category: categoryFromValue(data.category),
        transactionSource: transactionTypeFromValue(data.source),
        transactionType: '',
        amount: data.amount,
        date: data.date.toISOString(),
        currency: 'SGD',
      },
      hasAdditionalRules: data.hasAdditionalRules,
      rules: [] as Rule[],
    };
    const apiPath = `${process.env.NEXT_PUBLIC_SERVER_URL}/api/transactions`;
    const response = await fetch(apiPath, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTransaction),
    });
    if (response.ok) {
      console.log('Transaction added. Updating state');
      dispatch(addTransaction(newTransaction.transaction));
      dispatch(closeModal());
    }
  };

  return (
    <Box pt={4}>
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
                  autoFocus={true}
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
              name='date'
              rules={{ required: 'Transaction date is required' }}
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
          <FormControl as={HStack} mt={2} verticalAlign='middle'>
            <FormLabel htmlFor='additionalRules'>Additional Rules</FormLabel>
            <Switch id='additionalRules' {...register('hasAdditionalRules')} />
          </FormControl>
          {hasAdditionalRules && (
            <Tabs
              variant='enclosed'
              onChange={(index) => {
                switch (index) {
                  case 0:
                    setValue('additionalRules.rule', {
                      type: 'split',
                      frequency: 0,
                    } as SplitRule);
                    break;
                  case 1:
                    setValue('additionalRules.rule', {
                      type: 'repeat',
                      frequency: 0,
                    } as RepeatRule);
                    break;
                }
              }}
            >
              <TabList>
                <Tab>Split</Tab>
                <Tab>Repeat</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <Stack>
                    <FormControl as='fieldset'>
                      <FormLabel as='legend'>Frequency</FormLabel>
                      <InputGroup>
                        <Input
                          id='splitFrequency'
                          width='md'
                          {...register('additionalRules.rule.frequency')}
                        />
                        <InputRightElement width='2xs'>
                          <InputRightAddon borderRadius={0}>
                            per
                          </InputRightAddon>
                          <Select
                            id='splitInterval'
                            roundedLeft={0}
                            {...register('additionalRules.rule.interval')}
                            size='md'
                          >
                            <option key='day' value='daily'>
                              Day
                            </option>
                            <option key='week' value='weekly'>
                              Week
                            </option>
                            <option key='month' value='monthly'>
                              Month
                            </option>
                            <option key='year' value='yearly'>
                              Year
                            </option>
                          </Select>
                        </InputRightElement>
                      </InputGroup>
                    </FormControl>
                    <FormControl></FormControl>
                  </Stack>
                </TabPanel>
                <TabPanel></TabPanel>
              </TabPanels>
            </Tabs>
          )}
          <Flex alignItems='right' pt={4} pb={2}>
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
