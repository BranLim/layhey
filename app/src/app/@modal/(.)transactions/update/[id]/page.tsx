'use client';

import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/modal';
import { closeModal, selectIsOpenModal } from '@/states/common/modal.slice';
import { useRouter } from 'next/navigation';
import { useRef } from 'react';
import UpdateTransaction from '@/app/transactions/update/[id]/page';
import { useAppDispatch, useAppSelector } from '@/states/hooks';

interface Props {
  params: {
    id: string;
  };
}
export default function UpdateTransactionModal({ params }: Props) {
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
        <ModalHeader color='gray.500'>Update Transaction</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <UpdateTransaction params={params} />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
