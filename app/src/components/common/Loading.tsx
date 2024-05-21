import { Box, Flex, Spacer, Spinner, Text } from '@chakra-ui/react';

export const Loading = () => {
  return (
    <Box
      position='fixed'
      top='0'
      left='0'
      width='100vw'
      height='100vh'
      backgroundColor='rgba(0, 0, 0, 0.2)'
      zIndex='9999'
      display='flex'
      alignItems='center'
      justifyContent='center'
    >
      <Flex
        position='absolute'
        top='100px'
        left='48%'
        justifyContent='center'
        bg='white'
        border='4px solid gray'
        boxShadow='0px 0px 14px darkslategray'
        width='xs'
        borderRadius='16px'
        opacity='100'
        zIndex={999}
      >
        <Spinner
          thickness='4px'
          speed='0.65s'
          emptyColor='gray.200'
          color='darkslategray'
          size='xl'
          mt={2}
          mb={2}
        />
        <Text as={'b'} pl={4} pt={5} textAlign='center' fontSize='sm'>
          Loading Transactions...
        </Text>
      </Flex>
    </Box>
  );
};
