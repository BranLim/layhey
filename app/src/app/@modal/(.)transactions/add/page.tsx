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
        <ModalHeader></ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <AddTransaction />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
