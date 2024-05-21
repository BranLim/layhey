import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  Select,
  VStack,
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
  setAccountingPeriod,
} from '@/states/features/cashflow/cashflow-slice';
import { getCurrentYear, toFormattedDate } from '@/utils/date-utils';
import { useEffect } from 'react';

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
  const accountingPeriod = useAppSelector(selectAccountingPeriod);
  const {
    trigger,
    setError,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
    control,
  } = useForm<Input>({ defaultValues: defaultViewOptionValues });

  useEffect(() => {
    if (!accountingPeriod.startPeriod && !accountingPeriod.endPeriod) {
      console.log('Setting cashflow period');
      dispatch(
        setAccountingPeriod({
          startPeriod: startOfYear.toISOString(),
          endPeriod: endOfYear.toISOString(),
        })
      );
      return;
    }
    dispatch(
      getTransactions({
        startPeriod: accountingPeriod.startPeriod,
        endPeriod: accountingPeriod.endPeriod,
      })
    );
  }, [accountingPeriod.startPeriod, accountingPeriod.endPeriod]);

  const onSubmit: SubmitHandler<Input> = (data: Input) => {
    console.log(`Setting accounting period: ${JSON.stringify(data)}`);
    dispatch(
      setAccountingPeriod({
        startPeriod: data.startPeriod.toISOString(),
        endPeriod: data.endPeriod.toISOString(),
      })
    );
  };

  const onReset = () => {
    setValue('startPeriod', startOfYear);
    setValue('endPeriod', endOfYear);
    dispatch(
      setAccountingPeriod({
        startPeriod: startOfYear.toISOString(),
        endPeriod: endOfYear.toISOString(),
      })
    );
  };

  return (
    <>
      <Box
        position='absolute'
        bottom='80px'
        right='20px'
        zIndex='10'
        bg='white'
        border='2px'
        borderRadius='8px'
        boxShadow='0px 4px 6px 1px black'
        borderColor='gray'
        width='3xl'
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <VStack alignItems='left' p='0'>
            <Heading pl='2' pt='2' size='xs' justifyContent='left'>
              Cash Flow View Control
            </Heading>
            <HStack p='2'>
              <FormControl width='xs' isInvalid={!!errors.startPeriod}>
                <FormLabel htmlFor='accountingStartPeriod' fontSize='sm'>
                  Start Period
                </FormLabel>
                <Controller
                  name='startPeriod'
                  control={control}
                  rules={{
                    validate: (value, formValues) => {
                      const noOfDaysInMillis =
                        formValues.endPeriod.getTime() - value.getTime();
                      const noOfDays = noOfDaysInMillis / (1000 * 60 * 60 * 24);
                      if (noOfDays < 7) {
                        return false;
                      }
                      return true;
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
                        const endPeriodValidation = await trigger('endPeriod');
                        if (!endPeriodValidation) {
                          setError('endPeriod', {
                            type: 'focus',
                            message:
                              'Start and End Period should not be lesser than 7 days',
                          });
                        }
                      }}
                    />
                  )}
                />
              </FormControl>
              <FormControl width='xs' isInvalid={!!errors.endPeriod}>
                <FormLabel htmlFor='accountingEndPeriod' fontSize='sm'>
                  End Period
                </FormLabel>
                <Controller
                  name='endPeriod'
                  control={control}
                  rules={{
                    validate: (value, formValues): ValidateResult => {
                      const noOfDaysInMillis =
                        value.getTime() - formValues.startPeriod.getTime();
                      const noOfDays = noOfDaysInMillis / (1000 * 60 * 60 * 24);
                      if (noOfDays < 7) {
                        return false;
                      }
                      return true;
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
                            message:
                              'Start and End Period should not be lesser than 7 days',
                          });
                        }
                      }}
                    />
                  )}
                />
              </FormControl>
              <FormControl width='xs'>
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
                }}
              >
                Reset
              </Button>
            </HStack>
          </VStack>
        </form>
      </Box>
    </>
  );
};
