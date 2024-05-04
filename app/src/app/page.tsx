'use client';

import NextLink from 'next/link';
import {
  Box,
  Flex,
  IconButton,
  LinkBox,
  LinkOverlay,
  Spacer,
  Tooltip,
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { useDispatch } from 'react-redux';
import { openModal } from '../slices/modal-slice';

export default function Home() {
  const dispatch = useDispatch();
  const handleOpenModal = () => {
    dispatch(openModal());
  };

  return (
    <main>
      <Box w={580}>
        <Flex mt={20}>
          <Spacer />
          <Tooltip label='Add new Transaction'>
            <LinkBox>
              <LinkOverlay
                as={NextLink}
                href='/transactions/add'
                onClick={handleOpenModal}
              >
                <IconButton
                  background='green.400'
                  color='white'
                  icon={<AddIcon />}
                  aria-label='Add Transaction'
                ></IconButton>
              </LinkOverlay>
            </LinkBox>
          </Tooltip>
          <Spacer />
        </Flex>
      </Box>
    </main>
  );
}
