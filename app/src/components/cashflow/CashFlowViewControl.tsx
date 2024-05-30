import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  HStack,
  Input,
  Select,
  VStack,
  Text,
  Flex,
} from '@chakra-ui/react';
import {
  Controller,
  SubmitHandler,
  useForm,
  ValidateResult,
} from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '@/states/hooks';
import {
  getTransactions,
  selectAccountingPeriod,
  setCashFlowAccountingPeriod,
} from '@/states/features/cashflow/cashflow.slice';
import {
  calculateNumberOfDays,
  getCurrentYear,
  toFormattedDate,
} from '@/utils/date.utils';
import { useEffect, useState } from 'react';
import { useReactFlow } from 'reactflow';
import { defaultViewPort } from '@/components/cashflow/CashFlowView';
import { error } from '@chakra-ui/utils';
import {
  getAccountingPeriods,
  selectAccountingStoreStatus,
  selectPresetAccountingPeriod,
  selectPresetAccountingPeriods,
} from '@/states/features/accounting/accounting.slice';
import {
  SerializableAccountingPeriod,
  UserAccountingPeriod,
} from '@/types/AccountingPeriod';
import { selectCurrentAccountingPeriod } from '@/states/features/cashflow/flow.slice';

type Input = {
  startPeriod: Date;
  endPeriod: Date;
  displayCurrency: string;
};

const currentYear = getCurrentYear();
const startOfYear = new Date(currentYear, 0, 1);
const endOfYear = new Date(currentYear, 11, 31);
const defaultViewOptionValues: Input = {
  startPeriod: startOfYear,
  endPeriod: endOfYear,
  displayCurrency: 'SGD',
};

export const CashFlowViewControl = () => {
  const dispatch = useAppDispatch();
  const [selectedPeriodPreset, setSelectedPeriodPreset] = useState<string>();
  const accountingPeriodPresets = useAppSelector(selectPresetAccountingPeriods);
  const selectedAccountingPeriodPreset = useAppSelector((state) =>
    selectPresetAccountingPeriod(state, selectedPeriodPreset)
  );

  const {
    trigger,
    setError,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
    control,
  } = useForm<Input>({ defaultValues: defaultViewOptionValues });
  const reactFlow = useReactFlow();
  useEffect(() => {
    if (selectedPeriodPreset && selectedAccountingPeriodPreset) {
      setValue('startPeriod', selectedAccountingPeriodPreset.startPeriod);
      setValue('endPeriod', selectedAccountingPeriodPreset.endPeriod);
    } else {
      setValue('startPeriod', startOfYear);
      setValue('endPeriod', endOfYear);
    }
  }, [selectedPeriodPreset]);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = event.target.value;
    if (selectedValue) {
      setSelectedPeriodPreset(selectedValue);
    } else {
      setSelectedPeriodPreset('');
    }
  };

  const onSubmit: SubmitHandler<Input> = async (data: Input) => {
    console.log(`Setting accounting period: ${JSON.stringify(data)}`);
    const cashflowAccountingPeriod: SerializableAccountingPeriod = {
      startPeriod: new Date(data.startPeriod).toISOString(),
      endPeriod: new Date(data.endPeriod).toISOString(),
    };
    dispatch(setCashFlowAccountingPeriod(cashflowAccountingPeriod));
    await dispatch(getTransactions(cashflowAccountingPeriod));
  };

  const onReset = () => {
    setValue('startPeriod', startOfYear);
    setValue('endPeriod', endOfYear);
    dispatch(
      setCashFlowAccountingPeriod({
        startPeriod: startOfYear.toISOString(),
        endPeriod: endOfYear.toISOString(),
      })
    );
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <VStack
          position='absolute'
          bottom='80px'
          right='20px'
          zIndex='10'
          bg='white'
          border='2px'
          borderRadius='8px'
          boxShadow='0px 4px 6px 1px black'
          borderColor='gray'
          alignItems='left'
        >
          <Heading pl='2' pt='2' size='sm' justifyContent='left'>
            Cash Flow View
          </Heading>
          {accountingPeriodPresets && accountingPeriodPresets.length > 0 && (
            <HStack p={2}>
              <FormControl width='xs'>
                <FormLabel htmlFor='presetAccountingPeriod' fontSize='sm'>
                  Preset
                </FormLabel>
                <Select id='presetAccountingPeriod' onChange={handleChange}>
                  <option>Select Preset</option>
                  {accountingPeriodPresets?.map(
                    (preset: UserAccountingPeriod) => {
                      return (
                        <option key={preset.id} value={preset.id}>
                          {preset.name}
                        </option>
                      );
                    }
                  )}
                </Select>
              </FormControl>
            </HStack>
          )}
          <HStack p={2}>
            <FormControl width='2xs' isInvalid={!!errors.startPeriod}>
              <FormLabel htmlFor='accountingStartPeriod' fontSize='sm'>
                Start Period
              </FormLabel>
              <Controller
                name='startPeriod'
                control={control}
                rules={{
                  validate: (value, formValues) => {
                    const endPeriod =
                      typeof formValues.endPeriod === 'string'
                        ? new Date(formValues.endPeriod)
                        : formValues.endPeriod;

                    const startPeriod =
                      typeof value === 'string' ? new Date(value) : value;

                    const noOfDaysInMillis =
                      endPeriod.getTime() - startPeriod.getTime();

                    return calculateNumberOfDays(noOfDaysInMillis) >= 7;
                  },
                }}
                render={({ field }) => (
                  <Input
                    {...field}
                    id='accountingStartPeriod'
                    type='date'
                    value={toFormattedDate(
                      getValues('startPeriod'),
                      'yyyy-MM-dd'
                    )}
                    onChange={async (event) => {
                      field.onChange(new Date(event.target.value));
                      const startPeriodValidation =
                        await trigger('startPeriod');
                      if (!startPeriodValidation) {
                        setError('startPeriod', {
                          type: 'focus',
                          message: 'At least 7 days apart',
                        });
                      }
                    }}
                  />
                )}
              />
            </FormControl>
            <FormControl width='2xs' isInvalid={!!errors.endPeriod}>
              <FormLabel htmlFor='accountingEndPeriod' fontSize='sm'>
                End Period
              </FormLabel>
              <Controller
                name='endPeriod'
                control={control}
                rules={{
                  validate: (value, formValues): ValidateResult => {
                    const startPeriod =
                      typeof formValues.startPeriod === 'string'
                        ? new Date(formValues.startPeriod)
                        : formValues.startPeriod;

                    const endPeriod =
                      typeof value === 'string' ? new Date(value) : value;

                    const noOfDaysInMillis =
                      endPeriod.getTime() - startPeriod.getTime();

                    return calculateNumberOfDays(noOfDaysInMillis) >= 7;
                  },
                }}
                render={({ field }) => (
                  <Input
                    {...field}
                    id='accountingEndPeriod'
                    type='date'
                    value={toFormattedDate(
                      getValues('endPeriod'),
                      'yyyy-MM-dd'
                    )}
                    onChange={async (event) => {
                      field.onChange(new Date(event.target.value));
                      const endPeriodValidation = await trigger('endPeriod');
                      if (!endPeriodValidation) {
                        setError('endPeriod', {
                          type: 'focus',
                          message: 'At least 7 days apart',
                        });
                      }
                    }}
                  />
                )}
              />
            </FormControl>
            <FormControl width='4xs'>
              <FormLabel htmlFor='budgetCurrency' fontSize='sm'>
                Currency
              </FormLabel>
              <Select id='budgetCurrency'>
                <option>SGD</option>
              </Select>
            </FormControl>
            <Button mt='8' type='submit' colorScheme='blue' size='md'>
              Submit
            </Button>
            <Button
              mt='8'
              colorScheme='gray'
              size='md'
              onClick={() => {
                onReset();
                reactFlow.setViewport(defaultViewPort);
              }}
            >
              Reset
            </Button>
          </HStack>
          {(!!errors.startPeriod || !!errors.endPeriod) && (
            <Text pl={4} color='crimson'>
              Error: Start and End period should be at least 7 days apart.
            </Text>
          )}
        </VStack>
      </form>
    </>
  );
};
