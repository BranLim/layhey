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

export default function Home() {
  return (
    <main>
      <Box>
        <Flex mt={20}>
          <Spacer />
          <Tooltip label='Add new Transaction'>
            <LinkBox>
              <LinkOverlay as={NextLink} href='/transactions/add'>
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
