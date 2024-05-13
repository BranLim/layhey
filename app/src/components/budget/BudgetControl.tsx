import {
  Box,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  Select,
  VStack,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { toPeriod } from '@/utils/transaction-period-date-formatter';

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
  const {
    register,
    formState: { errors },
  } = useForm<Input>({ defaultValues: defaultViewOptionValues });
  return (
    <>
      <Box
        position='absolute'
        bottom='80px'
        right='20px'
        zIndex='10'
        bg='#fafafa'
        border='2px'
        borderRadius='8px'
        boxShadow='0px 4px 6px 1px black'
        borderColor='gray'
        width='lg'
      >
        <VStack alignItems='left'>
          <Heading pl='2' pt='2' size='xs' justifyContent='left'>
            Budget View Options
          </Heading>
          <HStack p='2'>
            <FormControl>
              <FormLabel htmlFor='budgetStartPeriod' fontSize='sm'>
                Start Period
              </FormLabel>
              <Input
                id='budgetStartPeriod'
                type='date'
                size='sm'
                {...register('startPeriod', { valueAsDate: false })}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor='budgetStartPeriod' fontSize='sm'>
                End Period
              </FormLabel>
              <Input
                id='budgetEndPeriod'
                type='date'
                size='sm'
                {...register('endPeriod', { valueAsDate: false })}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor='budgetCurrency' fontSize='sm'>
                Currency
              </FormLabel>
              <Select id='budgetCurrency' size='sm'>
                <option>SGD</option>
              </Select>
            </FormControl>
          </HStack>
        </VStack>
      </Box>
    </>
  );
};
