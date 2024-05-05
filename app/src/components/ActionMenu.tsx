'use client';

import { Flex, IconButton, Slide, Tooltip } from '@chakra-ui/react';
import * as React from 'react';
import { useRef, useState } from 'react';
import { AddIcon, EditIcon, HamburgerIcon } from '@chakra-ui/icons';
import NextLink from 'next/link';
import { useDispatch } from 'react-redux';
import { openModal } from '@/slices/modal-slice';
import { useDisclosure } from '@chakra-ui/hooks';

export const ActionMenu = () => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { isOpen, onToggle } = useDisclosure();
  const dispatch = useDispatch();
  const handleOpenModal = () => {
    dispatch(openModal());
  };

  return (
    <>
      <Flex position='relative'>
        <IconButton
          ref={buttonRef}
          icon={<HamburgerIcon />}
          aria-label={isOpen ? 'Close toolbar' : 'Open toolbar'}
          variant='solid'
          background='green.400'
          color='white'
          onClick={onToggle}
          width={12}
          height={12}
          zIndex='999'
        />
        <Slide direction='left' in={isOpen}>
          <Flex
            position='absolute'
            top={`${buttonRef.current?.offsetTop}px`}
            left={`${buttonRef.current?.offsetLeft + buttonRef.current?.offsetWidth + 4}px`}
            flexDirection='row'
            alignItems='center'
            p={2}
            color='white'
            rounded='md'
            shadow='md'
            zIndex='1'
            transition='0.3s'
          >
            <Tooltip label='Add new Transaction'>
              <IconButton
                as={NextLink}
                color='white'
                icon={<AddIcon />}
                aria-label='Add Transaction'
                onClick={handleOpenModal}
                href='/transactions/add'
                passHref
              ></IconButton>
            </Tooltip>
            <IconButton aria-label='Edit Transaction' icon={<EditIcon />} />
          </Flex>
        </Slide>
      </Flex>
    </>
  );
};
