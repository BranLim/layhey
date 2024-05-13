import { useRef } from 'react';
import {
  Flex,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  VStack,
} from '@chakra-ui/react';

export const BudgetControl = () => {
  const buttonRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <Flex
        position='fixed'
        top='120px'
        left='100px'
        alignItems='flex-start'
        zIndex='999'
        bg='white'
        border='2px'
        borderRadius='16px'
        boxShadow='2px 3px 8px gray'
        borderColor='gray'
        width='sm'
      >
        <VStack p='2' alignItems='left'>
          <Heading size='xs' justifyContent='left'>
            Budget Option
          </Heading>
          <HStack>
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
          </HStack>
        </VStack>
      </Flex>
    </>
  );
};
