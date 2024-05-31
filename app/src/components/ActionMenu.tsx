'use client';

import {
  Box,
  Collapse,
  Icon,
  IconButton,
  Stack,
  Tooltip,
} from '@chakra-ui/react';
import * as React from 'react';
import { useRef, useState } from 'react';
import { EditIcon, HamburgerIcon } from '@chakra-ui/icons';
import NextLink from 'next/link';
import { openModal } from '@/states/common/modal.slice';
import { useAppDispatch } from '@/states/hooks';
import AddAccountingPeriodIcon from '@/components/icons/AddAccountingPeriodIcon';
import { FaMoneyBillTransfer } from 'react-icons/fa6';

export const ActionMenu = () => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const dispatch = useAppDispatch();
  const handleOpenModal = (modalId: string) => {
    if (modalId) {
      dispatch(openModal(modalId));
    }
  };

  return (
    <>
      <Box
        position='absolute'
        bottom='80px'
        left='24px'
        zIndex='10'
        onMouseEnter={() => setIsExpanded((state) => !state)}
        onMouseLeave={() => setIsExpanded((state) => !state)}
      >
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
            size='lg'
            isRound={true}
            boxShadow='2px 3px 8px gray'
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
            bg='white'
            border='1px solid'
            borderColor='gainsboro'
            boxShadow='2px 3px 8px gray'
            borderRadius='3xl'
            mt='0px'
            zIndex='0'
            transition='transform 0.5s ease-in-out'
            transform={isExpanded ? 'translateX(54px)' : 'translateX(0)'}
          >
            <Stack direction='row'>
              <Tooltip label='Add new transaction' openDelay={500}>
                <IconButton
                  as={NextLink}
                  icon={<Icon as={FaMoneyBillTransfer} boxSize={8} />}
                  aria-label='Add Transaction'
                  onMouseDown={() => handleOpenModal('AddTransactionModal')}
                  href='/transactions/add'
                  passHref
                  size='lg'
                  isRound={true}
                  colorScheme='gray'
                  border='1px'
                  borderColor='lightgray'
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
                  border='1px'
                  borderColor='lightgray'
                  _hover={{
                    boxShadow: 'outline',
                  }}
                  _focus={{
                    boxShadow: 'outline',
                  }}
                  href='/transactions/update/6635f92426594141912d3a90'
                  passHref
                />
              </Tooltip>
              <Tooltip label='Add accounting period' openDelay={500}>
                <IconButton
                  as={NextLink}
                  icon={<AddAccountingPeriodIcon boxSize={8} />}
                  aria-label='Add Accounting Period'
                  onMouseDown={() =>
                    handleOpenModal('AddAccountingPeriodModal')
                  }
                  href='/accounting/period/add'
                  passHref
                  size='lg'
                  isRound={true}
                  colorScheme='gray'
                  border='1px'
                  borderColor='lightgray'
                  _hover={{
                    boxShadow: 'outline',
                  }}
                  _focus={{
                    boxShadow: 'outline',
                  }}
                ></IconButton>
              </Tooltip>
            </Stack>
          </Box>
        </Collapse>
      </Box>
    </>
  );
};
