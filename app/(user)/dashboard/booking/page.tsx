'use client';

import { useState } from 'react';
import { Button, Card, Space, Typography, Result } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

import BookingDialog from '@/components/user/booking/BookingDialog';
import BookingTable from '@/components/user/booking/BookingTable';

import { Booking } from '@/components/user/booking/types';

import { useAuthStore } from '@/store/authStore';

const { Title, Text } = Typography;

export default function BookingsPage() {
  const [open, setOpen] = useState(false);

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  /*
  |--------------------------------------------------------------------------
  | Auth Store
  |--------------------------------------------------------------------------
  */

  const { user, loading } = useAuthStore();

  /*
  |--------------------------------------------------------------------------
  | Permissions
  |--------------------------------------------------------------------------
  */

  const isAdmin = user?.role === 'admin';

  const permissions = Array.isArray((user as { permissions?: string[] } | null | undefined)?.permissions)
    ? ((user as { permissions?: string[] } | null | undefined)?.permissions ?? [])
    : [];

  /*
  |--------------------------------------------------------------------------
  | View Booking
  |--------------------------------------------------------------------------
  */

  const canView = user?.status === 'active' && (isAdmin || permissions.includes('booking.query'));

  /*
  |--------------------------------------------------------------------------
  | Create Booking
  |--------------------------------------------------------------------------
  */

  const canCreate =
    user?.status === 'active' && (isAdmin || permissions.includes('booking.create'));

  /*
  |--------------------------------------------------------------------------
  | Add Booking
  |--------------------------------------------------------------------------
  */

  const handleAddBooking = () => {
    setSelectedBooking(null);
    setOpen(true);
  };

  /*
  |--------------------------------------------------------------------------
  | Close Dialog
  |--------------------------------------------------------------------------
  */

  const handleClose = () => {
    setOpen(false);
    setSelectedBooking(null);
  };

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-slate-500">Loading...</div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Access Denied
  |--------------------------------------------------------------------------
  */

  if (!canView) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-6">
        <Result
          status="403"
          title="403"
          subTitle="You do not have permission to access Booking."
          extra={
            <Button
              type="primary"
              onClick={() => {
                window.location.href = '/dashboard';
              }}
            >
              Back to Dashboard
            </Button>
          }
        />
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Booking Page
  |--------------------------------------------------------------------------
  */

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}

      <Card>
        <div className="flex items-center justify-between">
          <div>
            <Title level={3} className="!mb-0">
              Flight Bookings
            </Title>

            <Text type="secondary">Manage flight enquiries and bookings.</Text>
          </div>

          {/* Create Permission */}

          {canCreate && (
            <Space>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAddBooking}>
                New Booking
              </Button>
            </Space>
          )}
        </div>
      </Card>

      {/* Booking Table */}

      <Card styles={{ body: { padding: 0 } }}>
        <BookingTable />
      </Card>

      {/* Booking Dialog */}

      {canCreate && (
        <BookingDialog
          open={open}
          onClose={handleClose}
          onSuccess={handleClose}
          booking={selectedBooking}
        />
      )}
    </div>
  );
}
