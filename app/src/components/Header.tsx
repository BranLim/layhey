import { Box, Flex, Heading } from '@chakra-ui/react';

export const Header = () => {
  return (
    <Flex align='center' justify='space-between' padding='1rem' boxShadow='md'>
      <Heading ml={4} color='gray.500'>
        Layhey
      </Heading>
    </Flex>
  );
};
