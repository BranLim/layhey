import { useRef } from 'react';
import {
  Flex,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  Select,
  VStack,
} from '@chakra-ui/react';

export const BudgetControl = () => {
  const buttonRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <Flex
        position='relative'
        top='20px'
        left='20px'
        alignItems='flex-start'
        zIndex='10'
        bg='white'
        border='2px'
        borderRadius='16px'
        boxShadow='2px 3px 8px gray'
        borderColor='gray'
        width='md'
      >
        <VStack alignItems='left'>
          <Heading pl='2' pt='2' size='xs' justifyContent='left'>
            Budget View Options
          </Heading>
          <HStack ml='4' p='2'>
            <FormControl>
              <FormLabel htmlFor='budgetStartPeriod' fontSize='sm'>
                Start Period
              </FormLabel>
              <Input id='budgetStartPeriod' type='date' size='sm' />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor='budgetStartPeriod' fontSize='sm'>
                End Period
              </FormLabel>
              <Input id='budgetEndPeriod' type='date' size='sm' />
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
      </Flex>
    </>
  );
};
