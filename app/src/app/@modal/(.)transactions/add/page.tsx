'use client';

import AddTransaction from '@/app/transactions/add/page';
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/modal';
import { Divider, Text } from '@chakra-ui/react';
import { closeModal, selectIsOpenModal } from '@/slices/modal-slice';
import { useRouter } from 'next/navigation';
import { useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';

export default function AddTransactionModal() {
  const ref = useRef(null);
  const isOpen = useAppSelector(selectIsOpenModal);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleCloseModal = () => {
    dispatch(closeModal());
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCloseModal}
      onCloseComplete={() => {
        router.push('/');
      }}
      size={'lg'}
      closeOnOverlayClick={false}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader color='gray.500'>Add Transaction</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text fontSize='sm'>
            A transaction can either be an income or expense. Once added, the
            transaction will be used as part of your cash flow calculation
            (depending on the selected accounting period).
          </Text>
          <Divider pb='4' />
          <AddTransaction />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
