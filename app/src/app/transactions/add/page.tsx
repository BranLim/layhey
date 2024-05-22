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
  Text,
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
import {
  AdvancedSetting,
  RepeatSetting,
  SplitSetting,
} from '@/types/AdvancedSetting';

type FormData = {
  category: string;
  date: Date;
  source: string;
  type?: string;
  amount: number;
  currency: string;
  hasAdvancedSetting?: boolean;
  advancedSetting?: AdvancedSetting;
};

const defaultFormValues: FormData = {
  category: TransactionCategory.Income,
  date: getCurrentDate(),
  source: '',
  type: '',
  amount: 0,
  currency: 'SGD',
  hasAdvancedSetting: false,
  advancedSetting: {
    option: {
      type: 'split',
      frequency: 0,
      interval: 'daily',
    },
  },
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

  const hasAdvancedSettings = useWatch({
    control,
    name: 'hasAdvancedSetting',
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
      hasAdvancedSetting: data.hasAdvancedSetting,
      advancedSetting: data.advancedSetting,
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
            <FormLabel htmlFor='additionalRules'>Advanced Settings</FormLabel>
            <Switch id='additionalRules' {...register('hasAdvancedSetting')} />
          </FormControl>
          {hasAdvancedSettings && (
            <Tabs
              variant='enclosed'
              onChange={(index) => {
                switch (index) {
                  case 0:
                    setValue('advancedSetting.option', {
                      type: 'split',
                      frequency: 0,
                    } as SplitSetting);
                    break;
                  case 1:
                    setValue('advancedSetting.option', {
                      type: 'repeat',
                      frequency: 0,
                    } as RepeatSetting);
                    break;
                }
              }}
            >
              <TabList>
                <Tab>Split</Tab>
                <Tab>Repeat</Tab>
              </TabList>
              <TabPanels border='2px solid #E2E8F0'>
                <TabPanel>
                  <Stack>
                    <Text as={'p'} fontSize={'sm'} pb={2}>
                      Split the above transaction into multiple transactions
                      equally. This is useful for transactions such as
                      traditional instalment plans offered by banks or buy-now,
                      pay-later (BNPL).
                    </Text>

                    <FormControl as='fieldset'>
                      <FormLabel as='legend'>Split Across</FormLabel>
                      <InputGroup>
                        <Input
                          id='splitFrequency'
                          {...register('advancedSetting.option.frequency')}
                        />
                        <InputRightElement width='4xs'>
                          <Select
                            id='splitInterval'
                            roundedLeft={0}
                            {...register('advancedSetting.option.interval')}
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
