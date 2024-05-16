'use client';

import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Spacer,
  Stack,
  Textarea,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { useAppDispatch } from '@/lib/hooks';
import { closeModal } from '@/slices/modal-slice';

type FormData = {
  name: string;
  description: string;
  startPeriod?: Date;
  endPeriod?: Date;
};

const AddAccountingPeriod = () => {
  const dispatch = useAppDispatch();
  const { register, handleSubmit } = useForm<FormData>();

  const handleCloseModal = () => {
    dispatch(closeModal());
  };

  const onSubmit = (data: FormData) => {};

  return (
    <Box pt={4}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={4}>
          <FormControl>
            <FormLabel htmlFor='name'>Name</FormLabel>
            <Input id='name' {...register('name', { required: true })} />
          </FormControl>

          <FormControl>
            <FormLabel htmlFor='description'>Description</FormLabel>
            <Textarea
              id='description'
              {...register('description', { required: false })}
            />
          </FormControl>
          <Flex alignItems='right' pt={4} pb={2}>
            <Spacer />
            <Button mt={4} mr={2} type='submit' colorScheme='blue'>
              Add
            </Button>
            <Button
              mt={4}
              mr={2}
              colorScheme='gray'
              onClick={() => handleCloseModal()}
            >
              Cancel
            </Button>
          </Flex>
        </Stack>
      </form>
    </Box>
  );
};

export default AddAccountingPeriod;
