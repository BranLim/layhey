import { Box, Flex, Heading, Text } from '@chakra-ui/react';

export const Footer = () => {
  return (
    <Flex
      position='sticky'
      bottom='0'
      align='center'
      bg='white'
      justify='space-between'
      borderTop='1px solid'
      borderColor='gray.200'
      height='60px'
      padding='1rem'
      boxShadow='0 -4px 6px -1px rgba(0, 0, 0, 0.1), 0 -4px 10px 0 rgba(0, 0, 0, 0.08)'
    >
      <Text fontSize='sm' align='center'>
        &copy; 2024 Layhill Tech. All rights reserved.
      </Text>
    </Flex>
  );
};
