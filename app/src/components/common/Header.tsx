import { Flex, Heading, Link, Stack } from '@chakra-ui/react';
import NextLink from 'next/link';

export const Header = () => {
  return (
    <Flex
      position='sticky'
      top='0'
      align='center'
      justify='space-between'
      padding='1rem'
      boxShadow='md'
      bg='white'
    >
      <Stack ml={4}>
        <Heading as={NextLink} size='xl' color='gray.500' href='/'>
          Layhey
        </Heading>
        <Heading size='sm'>Budgeting Made Simple</Heading>
      </Stack>
    </Flex>
  );
};
