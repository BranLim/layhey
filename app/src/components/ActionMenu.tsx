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
import {
  AddIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  EditIcon,
  HamburgerIcon,
} from '@chakra-ui/icons';
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
            icon={isExpanded ? <ChevronDownIcon /> : <ChevronUpIcon />}
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
          <Collapse in={isExpanded} animateOpacity>
            <Box
              position='absolute'
              bottom='10'
              right='-1.5'
              width='calc(100% + 17px)'
              p='2'
              bg='white.300'
              border='1px solid'
              borderColor='gainsboro'
              boxShadow='lg'
              borderRadius='3xl'
              mt='0px'
              zIndex='0'
              transition='transform 0.5s ease-in-out'
              transform={isExpanded ? 'translateY(-20%)' : 'translateY(0)'}
            >
              <Stack>
                <Tooltip label='Add new Transaction'>
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
                <IconButton
                  aria-label='Edit Transaction'
                  size='lg'
                  colorScheme='gray'
                  icon={<EditIcon />}
                  isRound={true}
                  _hover={{
                    boxShadow: 'outline',
                  }}
                  _focus={{
                    boxShadow: 'outline',
                  }}
                />
              </Stack>
            </Box>
          </Collapse>
        </Box>
      </Flex>
    </>
  );
};
