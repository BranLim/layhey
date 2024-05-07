'use client';

import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/modal';
import { useDispatch, useSelector } from 'react-redux';
import { closeModal, selectIsOpenModal } from '@/slices/modal-slice';
import { useRouter } from 'next/navigation';
import { useRef } from 'react';
import UpdateTransaction from '@/app/transactions/update/[id]/page';

interface Props {
  params: {
    id: string;
  };
}
export default function UpdateTransactionModal({ params }: Props) {
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
          <UpdateTransaction params={params} />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
