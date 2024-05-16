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
import { SubmitHandler, useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import {
  getTransactions,
  selectBudgetPeriod,
  selectBudgetSummary,
  setBudgetPeriod,
} from '@/slices/transaction-slice';
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

export const BudgetControl = () => {
  const dispatch = useAppDispatch();
  const budgetPeriod = useAppSelector(selectBudgetPeriod);
  const budgetSummary = useAppSelector(selectBudgetSummary);
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<Input>({ defaultValues: defaultViewOptionValues });

  useEffect(() => {
    if (!budgetPeriod.startPeriod && !budgetPeriod.endPeriod) {
      console.log('Setting budget period');
      dispatch(
        setBudgetPeriod({
          startPeriod: startOfYear.toISOString(),
          endPeriod: endOfYear.toISOString(),
        })
      );
      return;
    }
    console.log(`Updating Budget Period: ${JSON.stringify(budgetSummary)}`);
    dispatch(
      getTransactions({
        startPeriod: budgetPeriod.startPeriod,
        endPeriod: budgetPeriod.endPeriod,
      })
    );
  }, [budgetPeriod.startPeriod, budgetPeriod.endPeriod]);

  const onSubmit: SubmitHandler<Input> = (data: Input) => {
    console.log(data);
    dispatch(
      setBudgetPeriod({
        startPeriod: data.startPeriod,
        endPeriod: data.endPeriod,
      })
    );
  };

  const onReset = () => {
    setValue('startPeriod', startOfYear);
    setValue('endPeriod', endOfYear);
    dispatch(
      setBudgetPeriod({
        startPeriod: startOfYear,
        endPeriod: endOfYear,
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
        bg='#fdfdfd'
        border='2px'
        borderRadius='8px'
        boxShadow='0px 4px 6px 1px black'
        borderColor='gray'
        width='3xl'
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <VStack alignItems='left' p='0'>
            <Heading pl='2' pt='2' size='xs' justifyContent='left'>
              Budget View Options
            </Heading>
            <HStack p='2'>
              <FormControl width='xs'>
                <FormLabel htmlFor='budgetStartPeriod' fontSize='sm'>
                  Start Period
                </FormLabel>
                <Input
                  id='budgetStartPeriod'
                  type='date'
                  value={toFormattedDate(
                    getValues('startPeriod'),
                    'yyyy-MM-dd'
                  )}
                  {...register('startPeriod', { valueAsDate: true })}
                />
              </FormControl>
              <FormControl width='xs'>
                <FormLabel htmlFor='budgetEndPeriod' fontSize='sm'>
                  End Period
                </FormLabel>
                <Input
                  id='budgetEndPeriod'
                  type='date'
                  value={toFormattedDate(getValues('endPeriod'), 'yyyy-MM-dd')}
                  {...register('endPeriod', { valueAsDate: true })}
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
