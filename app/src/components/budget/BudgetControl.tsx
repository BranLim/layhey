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
import { toPeriod } from '@/utils/transaction-period-date-formatter';
import { useAppDispatch } from '@/lib/hooks';
import { setBudgetPeriod } from '@/slices/transaction-slice';

type Input = {
  startPeriod: string;
  endPeriod: string;
  displayCurrency: string;
};

const currentYear = new Date().getFullYear();
const startOfYear = toPeriod(new Date(currentYear, 0, 1), 'yyyy-MM-dd');
const endOfYear = toPeriod(new Date(currentYear, 11, 31), 'yyyy-MM-dd');
const defaultViewOptionValues: Input = {
  startPeriod: startOfYear,
  endPeriod: endOfYear,
  displayCurrency: 'SGD',
};

export const BudgetControl = () => {
  const dispatch = useAppDispatch();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<Input>({ defaultValues: defaultViewOptionValues });

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
                  {...register('startPeriod', { valueAsDate: false })}
                />
              </FormControl>
              <FormControl width='xs'>
                <FormLabel htmlFor='budgetStartPeriod' fontSize='sm'>
                  End Period
                </FormLabel>
                <Input
                  id='budgetEndPeriod'
                  type='date'
                  {...register('endPeriod', { valueAsDate: false })}
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
