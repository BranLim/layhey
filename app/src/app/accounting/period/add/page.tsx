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
import { Controller, useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '@/states/hooks';
import { closeModal } from '@/states/common/modal.slice';
import { getCurrentDate, toFormattedDate } from '@/utils/date.utils';
import { AddAccountingPeriodRequest } from '@/types/AccountingPeriod';
import {
  addAccountingPeriod,
  selectStatus,
} from '@/states/features/accounting/accounting.slice';
import { useEffect } from 'react';

type FormData = {
  name: string;
  description: string;
  startPeriod: Date;
  endPeriod: Date;
};

const initialFormData: FormData = {
  name: '',
  description: '',
  startPeriod: getCurrentDate(),
  endPeriod: getCurrentDate(),
};

const AddAccountingPeriod = () => {
  const dispatch = useAppDispatch();
  const accountStateStatus = useAppSelector(selectStatus);
  const { handleSubmit, control, getValues } = useForm<FormData>({
    defaultValues: initialFormData,
  });

  useEffect(() => {
    if (accountStateStatus === 'idle') {
      return;
    }
    if (accountStateStatus === 'succeeded') {
      handleCloseModal();
    }
  }, [accountStateStatus]);

  const handleCloseModal = () => {
    dispatch(closeModal());
  };

  const onSubmit = (data: FormData) => {
    const { name, description, startPeriod, endPeriod } = data;
    const addAccountingPeriodRequest: AddAccountingPeriodRequest = {
      data: {
        name: name,
        description: description,
        startPeriod: startPeriod.toISOString(),
        endPeriod: endPeriod.toISOString(),
      },
    };
    console.log(`Submitting ${JSON.stringify(addAccountingPeriodRequest)}`);
    dispatch(addAccountingPeriod(addAccountingPeriodRequest));
  };

  return (
    <Box pt={4}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={4}>
          <FormControl>
            <FormLabel htmlFor='name'>Name</FormLabel>
            <Controller
              control={control}
              name={'name'}
              rules={{ required: true }}
              render={({ field }) => (
                <Input
                  {...field}
                  id='name'
                  type='text'
                  value={getValues('name')}
                  onChange={(event) => field.onChange(event.target.value)}
                />
              )}
            />
          </FormControl>

          <FormControl>
            <FormLabel htmlFor='description'>Description</FormLabel>
            <Controller
              control={control}
              name={'description'}
              render={({ field }) => <Textarea {...field} id='description' />}
            />
          </FormControl>
          <FormControl>
            <FormLabel htmlFor='startPeriod'>Start Period</FormLabel>
            <Controller
              control={control}
              name='startPeriod'
              render={({ field }) => (
                <Input
                  {...field}
                  id='startPeriod'
                  type='date'
                  value={toFormattedDate(
                    getValues('startPeriod'),
                    'yyyy-MM-dd'
                  )}
                  onChange={(event) =>
                    field.onChange(new Date(event.target.value))
                  }
                />
              )}
            />
          </FormControl>
          <FormControl>
            <FormLabel htmlFor='endPeriod'>End Period</FormLabel>
            <Controller
              control={control}
              name={'endPeriod'}
              render={({ field }) => (
                <Input
                  {...field}
                  id={'endPeriod'}
                  type='date'
                  value={toFormattedDate(getValues('endPeriod'), 'yyyy-MM-dd')}
                  onChange={(event) =>
                    field.onChange(new Date(event.target.value))
                  }
                />
              )}
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
              onMouseDown={() => handleCloseModal()}
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
