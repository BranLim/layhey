'use client';

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
import AddAccountingPeriod from '@/app/accounting/period/add/page';

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
        <ModalHeader color='gray.500'>Create Accounting Period</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text fontSize='sm'>
            Define an accounting period to simplify and speed up your workflow
            when using Cash Flow Viewer.
          </Text>
          <Divider pb={4} />
          <AddAccountingPeriod />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
