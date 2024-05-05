'use client';

import {
  Box,
  IconButton,
  LinkBox,
  LinkOverlay,
  Tooltip,
} from '@chakra-ui/react';
import * as React from 'react';
import { useState } from 'react';
import { AddIcon, HamburgerIcon } from '@chakra-ui/icons';
import { useDisclosure } from '@chakra-ui/hooks';
import NextLink from 'next/link';
import { useDispatch } from 'react-redux';
import { openModal } from '@/slices/modal-slice';

export const ActionMenu = () => {
  const dispatch = useDispatch();
  const handleOpenModal = () => {
    dispatch(openModal());
  };

  const { isOpen, onToggle } = useDisclosure();
  const [expanded, setExpanded] = useState(false);

  const handleExpand = () => {
    setExpanded(!expanded);
  };

  return (
    <>
      <Box>
        <IconButton
          icon={<HamburgerIcon />}
          aria-label={isOpen ? 'Close toolbar' : 'Open toolbar'}
          variant='solid'
          background='green.400'
          color='white'
          onClick={handleExpand}
          width={12}
          height={12}
        />
        <Box
          position='fixed'
          top={6}
          width={12}
          zIndex='999'
          display='flex'
          alignItems='center'
          borderRadius='md'
          boxShadow='md'
          bg='gray.200'
          cursor='pointer'
          transition='all 0.3s'
          transform={expanded ? 'translateY(-100)' : 'translateY(0)'}
          opacity={expanded ? 1 : 0}
        >
          {expanded && (
            <Box m={1} alignItems='center'>
              {/* Add your icon buttons or menu items here */}
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
            </Box>
          )}
        </Box>
      </Box>
    </>
  );
};
