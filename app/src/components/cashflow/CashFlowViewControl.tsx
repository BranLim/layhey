import {
  Button,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  Select,
  Text,
  VStack,
} from '@chakra-ui/react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '@/states/hooks';
import {
  getCashFlows,
  getOverallCashFlowSummary,
  selectOverallCashFlowSummary,
  setOverallCashFlowStatementPeriod,
} from '@/states/features/cashflow/cashflow.slice';
import {
  calculateNumberOfDays,
  getCurrentYear,
  toFormattedDate,
} from '@/utils/date.utils';
import { useEffect, useState } from 'react';
import { useReactFlow } from 'reactflow';
import { defaultViewPort } from '@/components/cashflow/CashFlowView';
import {
  selectPresetAccountingPeriod,
  selectPresetAccountingPeriods,
} from '@/states/features/accounting/accounting.slice';
import {
  SerializableAccountingPeriod,
  UserAccountingPeriod,
} from '@/types/AccountingPeriod';
import { selectRootNode } from '@/states/features/cashflow/flow.slice';
import { GetTransactionRequest } from '@/types/CashFlow';

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
  const [isSubmitButtonEnabled, setIsSubmitButtonEnabled] =
    useState<boolean>(true);
  const overallCashFlowSummary = useAppSelector(selectOverallCashFlowSummary);
  const overallCashFlowSummaryNode = useAppSelector(selectRootNode);

  const {
    trigger,
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

  const updateCashFlowView = (startPeriod: Date, endPeriod: Date) => {
    const accountingPeriod: SerializableAccountingPeriod = {
      startPeriod: startPeriod.toISOString(),
      endPeriod: endPeriod.toISOString(),
    };
    const request: GetTransactionRequest = {
      ...accountingPeriod,
      append: false,
      parentStatementSlotId: overallCashFlowSummary.id,
      parentNodeId: overallCashFlowSummaryNode.id,
    };
    dispatch(setOverallCashFlowStatementPeriod(accountingPeriod));
    dispatch(getOverallCashFlowSummary(request));
    dispatch(getCashFlows(request));
  };

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
    updateCashFlowView(data.startPeriod, data.endPeriod);
  };

  const onReset = () => {
    setValue('startPeriod', startOfYear);
    setValue('endPeriod', endOfYear);
    updateCashFlowView(startOfYear, endOfYear);
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
                  validate: {
                    validDate: (value) => {
                      const startPeriod =
                        typeof value === 'string' ? new Date(value) : value;

                      return (
                        !Number.isNaN(startPeriod.getTime()) ||
                        'Start period is not a valid date'
                      );
                    },
                    atLeastAWeekApart: (value, formValues) => {
                      const startPeriod =
                        typeof value === 'string' ? new Date(value) : value;

                      const endPeriod =
                        typeof formValues.endPeriod === 'string'
                          ? new Date(formValues.endPeriod)
                          : formValues.endPeriod;

                      const noOfDaysInMillis =
                        endPeriod.getTime() - startPeriod.getTime();

                      return (
                        calculateNumberOfDays(noOfDaysInMillis) >= 7 ||
                        'Start and End period should be at least 7 days apart'
                      );
                    },
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
                      const valid = await trigger('startPeriod');
                      setIsSubmitButtonEnabled(valid);
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
                  validate: {
                    validDate: (value) => {
                      const endPeriod =
                        typeof value === 'string' ? new Date(value) : value;
                      return (
                        !Number.isNaN(endPeriod.getTime()) ||
                        'End period is not a valid date'
                      );
                    },
                    atLeastAWeekApart: (value, formValues) => {
                      const endPeriod =
                        typeof value === 'string' ? new Date(value) : value;
                      const startPeriod =
                        typeof formValues.startPeriod === 'string'
                          ? new Date(formValues.startPeriod)
                          : formValues.startPeriod;

                      const noOfDaysInMillis =
                        endPeriod.getTime() - startPeriod.getTime();

                      return (
                        calculateNumberOfDays(noOfDaysInMillis) >= 7 ||
                        'Start and End period should be at least 7 days apart'
                      );
                    },
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
                      const valid = await trigger('endPeriod');
                      setIsSubmitButtonEnabled(valid);
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
            <Button
              mt='8'
              type='submit'
              colorScheme='blue'
              size='md'
              isDisabled={!isSubmitButtonEnabled}
            >
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
              {errors.startPeriod?.message || errors.endPeriod?.message}
            </Text>
          )}
        </VStack>
      </form>
    </>
  );
};
