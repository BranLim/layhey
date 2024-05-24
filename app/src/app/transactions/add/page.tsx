'use client';

import {
  Box,
  Button,
  Divider,
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
  modeFromValue,
  TransactionMode,
  TransactionResponse,
  TransactionSource,
  transactionSourceFromValue,
} from '@/types/Transaction';
import { NumericFormat } from 'react-number-format';
import { closeModal } from '@/states/common/modal.slice';
import { addTransaction } from '@/states/features/cashflow/cashflow.slice';
import { useAppDispatch } from '@/states/hooks';
import { getCurrentDate, toFormattedDate } from '@/utils/date.utils';
import {
  AdvancedSetting,
  RepeatSetting,
  SplitSetting,
} from '@/types/AdvancedSetting';
import { ScheduleRadioGroup } from '@/components/common/ScheduleRadioGroup';

const defaultInterval = 'monthly';

type FormData = {
  mode: string;
  date: Date;
  source: string;
  type?: string;
  amount: number;
  currency: string;
  hasAdvancedSetting?: boolean;
  advancedSetting?: AdvancedSetting;
};

const defaultFormValues: FormData = {
  mode: TransactionMode.Income,
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
      interval: defaultInterval,
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
    console.log(`Submitting Transaction: ${JSON.stringify(data)}`);
    const newTransaction: AddTransactionRequest = {
      transaction: {
        id: '',
        mode: modeFromValue(data.mode),
        transactionSource: transactionSourceFromValue(data.source),
        transactionType: '',
        amount: data.amount,
        date: data.date.toISOString(),
        currency: 'SGD',
      },
      hasAdvancedSetting: data.hasAdvancedSetting,
      advancedSetting: data.advancedSetting,
    };
    dispatch(addTransaction(newTransaction));
    handleCloseModal();
  };

  return (
    <Box pt={4}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={4}>
          <FormControl>
            <RadioGroup defaultValue='Income'>
              <HStack>
                <Radio value='Income' {...register('mode')}>
                  Income
                </Radio>
                <Radio value='Expense' {...register('mode')}>
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
          <FormControl as={HStack} mt={4} verticalAlign='middle'>
            <FormLabel htmlFor='additionalRules'>Advanced Settings</FormLabel>
            <Switch id='additionalRules' {...register('hasAdvancedSetting')} />
          </FormControl>
          {hasAdvancedSettings && (
            <Tabs
              variant='enclosed'
              onChange={(index) => {
                switch (index) {
                  case 0:
                    setValue('advancedSetting.option.type', 'split');
                    break;
                  case 1:
                    setValue('advancedSetting.option.type', 'repeat');
                    break;
                }
              }}
            >
              <TabList>
                <Tab>Split</Tab>
                <Tab>Duplicate</Tab>
              </TabList>
              <TabPanels border='2px solid #E2E8F0'>
                <TabPanel>
                  <Stack>
                    <Text as={'p'} fontSize={'sm'}>
                      Split the amount of the above transaction equally across
                      multiple transactions. Then, each created transaction will
                      have different transaction date.
                    </Text>
                    <Text as={'p'} fontSize={'sm'} pb={2}>
                      This is useful for transactions such as traditional
                      instalment plans offered by banks or buy-now, pay-later
                      (BNPL).
                    </Text>

                    <FormControl as='fieldset'>
                      <FormLabel as='legend'>Split Across</FormLabel>
                      <Controller
                        name='advancedSetting.option.frequency'
                        control={control}
                        render={({ field }) => (
                          <Input {...field} id='splitFrequency' pb={2} />
                        )}
                      />
                      <ScheduleRadioGroup
                        register={register}
                        registerPropPath={'advancedSetting.option.interval'}
                        defaultValue={defaultInterval}
                        enableDayOption={false}
                      />
                    </FormControl>
                  </Stack>
                </TabPanel>
                <TabPanel>
                  <Stack>
                    <Text as={'p'} fontSize={'sm'}>
                      Create multiple copies of the above transaction. Each copy
                      of the transaction will have different date.
                    </Text>
                    <Text as={'p'} fontSize={'sm'}>
                      This is useful for transactions that repeat multiple times
                      such as receiving salaries, dividends, or paying taxes.
                    </Text>
                    <Stack pt={2}>
                      <FormControl as='fieldset' ml={2} pr={4}>
                        <FormLabel as='legend'>
                          Create one transaction for next
                        </FormLabel>
                        <Controller
                          name='advancedSetting.option.frequency'
                          control={control}
                          render={({ field }) => (
                            <Input {...field} id='repeatFrequency' pb={2} />
                          )}
                        />
                        <ScheduleRadioGroup
                          register={register}
                          registerPropPath={'advancedSetting.option.interval'}
                          defaultValue={defaultInterval}
                          enableDayOption={false}
                        />
                      </FormControl>
                    </Stack>
                  </Stack>
                </TabPanel>
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
