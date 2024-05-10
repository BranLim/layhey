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
import { openModal } from '@/slices/modal-slice';
import { useAppDispatch } from '@/lib/hooks';

export const ActionMenu = () => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const dispatch = useAppDispatch();
  const handleOpenModal = () => {
    dispatch(openModal());
  };

  return (
    <>
      <Flex
        position='fixed'
        top='100px'
        left='45%'
        alignItems='flex-end'
        zIndex='999'
      >
        <Box position='relative'>
          <Tooltip
            label='Action menu for transaction management. Click to expand.'
            openDelay={500}
          >
            <IconButton
              ref={buttonRef}
              icon={<HamburgerIcon />}
              aria-label={isExpanded ? 'Close toolbar' : 'Open toolbar'}
              variant='solid'
              colorScheme='blue'
              onClick={() => setIsExpanded(!isExpanded)}
              size='lg'
              zIndex='999'
              isRound={true}
              _hover={{
                boxShadow: 'outline',
              }}
              _focus={{
                boxShadow: 'outline',
              }}
            />
          </Tooltip>

          <Collapse in={isExpanded} animateOpacity>
            <Box
              position='absolute'
              bottom='-1.5'
              left='0'
              p='2'
              bg='white.300'
              border='1px solid'
              borderColor='gainsboro'
              boxShadow='lg'
              borderRadius='3xl'
              mt='0px'
              zIndex='0'
              transition='transform 0.5s ease-in-out'
              transform={isExpanded ? 'translateX(50%)' : 'translateX(0)'}
            >
              <Stack direction='row'>
                <Tooltip label='Add new transaction' openDelay={500}>
                  <IconButton
                    as={NextLink}
                    icon={<AddIcon />}
                    aria-label='Add Transaction'
                    onClick={handleOpenModal}
                    href='/transactions/add'
                    passHref
                    size='lg'
                    colorScheme='gray'
                    isRound={true}
                    _hover={{
                      boxShadow: 'outline',
                    }}
                    _focus={{
                      boxShadow: 'outline',
                    }}
                  ></IconButton>
                </Tooltip>
                <Tooltip label='Edit selected transaction' openDelay={500}>
                  <IconButton
                    as={NextLink}
                    aria-label='Edit Transaction'
                    icon={<EditIcon />}
                    size='lg'
                    colorScheme='gray'
                    isRound={true}
                    _hover={{
                      boxShadow: 'outline',
                    }}
                    _focus={{
                      boxShadow: 'outline',
                    }}
                    onClick={handleOpenModal}
                    href='/transactions/update/6635f92426594141912d3a90'
                    passHref
                  />
                </Tooltip>
              </Stack>
            </Box>
          </Collapse>
        </Box>
      </Flex>
    </>
  );
};
