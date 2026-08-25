'use client';

import { useState } from 'react';
import { Button, Card, Space, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

import BookingDialog from '@/components/user/booking/BookingDialog';
import BookingTable from '@/components/user/booking/BookingTable';

import { Booking } from '@/components/user/booking/types';

const { Title, Text } = Typography;

export default function BookingsPage() {
  const [open, setOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const handleAddBooking = () => {
    setSelectedBooking(null);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedBooking(null);
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <Title level={3} className="!mb-0">
              Flight Bookings
            </Title>

            <Text type="secondary">Manage flight enquiries and bookings.</Text>
          </div>

          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddBooking}>
              New Booking
            </Button>
          </Space>
        </div>
      </Card>

      <Card styles={{ body: { padding: 0 } }}>
        <BookingTable />
      </Card>

      <BookingDialog
        open={open}
        onClose={handleClose}
        onSuccess={handleClose}
        booking={selectedBooking}
      />
    </div>
  );
}