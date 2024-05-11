import { Box, Flex, Heading, Stack, Text } from '@chakra-ui/react';

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
        <Heading size='xl' color='gray.500'>
          Layhey
        </Heading>
        <Heading size='sm'>Budgeting Made Simple</Heading>
      </Stack>
    </Flex>
  );
};
