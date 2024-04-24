import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  NumberInput,
  NumberInputField,
  Select,
  Spacer,
  Stack,
} from '@chakra-ui/react';

export default function AddTransaction() {
  return (
    <Box p={4} w={480}>
      <form>
        <Stack spacing={4}>
          <FormControl isRequired>
            <FormLabel htmlFor='transactionAmount'>Amount</FormLabel>
            <NumberInput id='transactionAmount' max={50}>
              <NumberInputField />
            </NumberInput>
          </FormControl>
          <FormControl>
            <FormLabel htmlFor='transactionCategory'>Category</FormLabel>
            <Select id='transactionCategory' placeholder='Transaction Category'>
              <option>Income</option>
              <option>Expense</option>
            </Select>
          </FormControl>
          <FormControl>
            <FormLabel htmlFor='transactionDate'>Date</FormLabel>
            <Input id='transactionDate' type='date' />
          </FormControl>
          <Flex alignItems='right'>
            <Spacer />
            <Button mt={4} mr={2} type='submit' colorScheme='green'>
              Add
            </Button>
            <Button mt={4} mr={2} colorScheme='red'>
              Cancel
            </Button>
          </Flex>
        </Stack>
      </form>
    </Box>
  );
}
