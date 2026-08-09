'use client';

import { Modal } from 'antd';

import BookingForm from './BookingForm';
import { Booking } from './types';

interface BookingDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  booking?: Booking | null;
}

export default function BookingDialog({ open, onClose, onSuccess, booking }: BookingDialogProps) {
  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={500}
      destroyOnHidden
      centered
      mask={{ closable: false }}
      title={booking ? 'Edit Booking' : 'New Booking'}
    >
      <BookingForm booking={booking} onCancel={onClose} onSuccess={onSuccess} />
    </Modal>
  );
}