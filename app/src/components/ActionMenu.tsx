'use client';

import {
  Box,
  Collapse,
  Flex,
  IconButton,
  Stack,
  Tooltip,
} from '@chakra-ui/react';
import * as React from 'react';
import { useRef, useState } from 'react';
import { AddIcon, EditIcon, HamburgerIcon } from '@chakra-ui/icons';
import NextLink from 'next/link';
import { useDispatch } from 'react-redux';
import { openModal } from '@/slices/modal-slice';

export const ActionMenu = () => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const dispatch = useDispatch();
  const handleOpenModal = () => {
    dispatch(openModal());
  };

  return (
    <>
      <Flex
        position='fixed'
        bottom='40px'
        right='40px'
        alignItems='flex-end'
        zIndex='999'
      >
        <Box position='relative'>
          <IconButton
            ref={buttonRef}
            icon={<HamburgerIcon />}
            aria-label={isExpanded ? 'Close toolbar' : 'Open toolbar'}
            variant='solid'
            background='green.400'
            color='white'
            onClick={() => setIsExpanded(!isExpanded)}
            size='lg'
            zIndex='999'
            borderRadius='full'
          />
          <Collapse in={isExpanded} animateOpacity>
            <Box
              position='absolute'
              bottom='100%'
              right='-0.5'
              width='calc(100% + 8px)'
              p='2'
              bg='white'
              boxShadow='md'
              borderRadius='md'
              mt='0px'
              zIndex='0'
              transition='transform 0.5s ease-in-out'
              transform={isExpanded ? 'translateY(-20%)' : 'translateY(0)'}
            >
              <Stack>
                <Tooltip label='Add new Transaction'>
                  <IconButton
                    as={NextLink}
                    color='white'
                    icon={<AddIcon />}
                    aria-label='Add Transaction'
                    onClick={handleOpenModal}
                    href='/transactions/add'
                    passHref
                    size='md'
                  ></IconButton>
                </Tooltip>
                <IconButton aria-label='Edit Transaction' icon={<EditIcon />} />
              </Stack>
            </Box>
          </Collapse>
        </Box>
      </Flex>
    </>
  );
};
