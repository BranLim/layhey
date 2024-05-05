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
import { useDisclosure } from '@chakra-ui/hooks';
import { useDispatch, useSelector } from 'react-redux';
import { closeModal, selectIsOpenModal } from '@/slices/modal-slice';
import { useRouter } from 'next/navigation';
import { useRef } from 'react';

export default function AddTransactionModal() {
  const ref = useRef(null);
  const isOpen = useSelector(selectIsOpenModal);
  const dispatch = useDispatch();
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
