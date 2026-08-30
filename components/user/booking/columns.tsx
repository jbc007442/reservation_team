'use client';

import Link from 'next/link';
import { createElement } from 'react';

import { EyeOutlined, EditOutlined, DeleteOutlined, MoreOutlined } from '@ant-design/icons';

import { Badge, Tag, Button, Dropdown } from 'antd';
import dayjs from 'dayjs';

import { Booking } from './types';
import { useAuthStore } from '@/store/authStore';

const statusColor = {
  booking_created: '#1677ff',
  auth_pending: '#faad14',
  auth_completed: '#52c41a',
  ticketed: '#389e0d',
  cancelled: '#ff4d4f',
  refunded: '#13c2c2',
  charge_back: '#fa541c',
  follow_up: '#d4b106',
  card_charged: '#52c41a',
  card_decline: '#cf1322',
} as const;

interface BookingColumnsProps {
  onEdit: (booking: Booking) => void;
  onDelete?: (booking: Booking) => void;
}

export const bookingColumns = ({ onEdit, onDelete }: BookingColumnsProps) => {
  const { user } = useAuthStore();

  /*
  |--------------------------------------------------------------------------
  | User Permissions
  |--------------------------------------------------------------------------
  */

  const isAdmin = user?.role === 'admin';

  const permissions: string[] = (user as { permissions?: string[] } | null)?.permissions || [];

  /*
  |--------------------------------------------------------------------------
  | Permission Checks
  |--------------------------------------------------------------------------
  */

  // View Auth Form
  const canViewAuthForm = isAdmin || permissions.includes('booking.authform.view');

  // Edit Booking
  const canEdit = isAdmin || permissions.includes('booking.edit');

  // Delete Booking
  const canDelete = isAdmin || permissions.includes('booking.delete');

  return [
    /*
    |--------------------------------------------------------------------------
    | Booking No
    |--------------------------------------------------------------------------
    */

    {
      title: 'Booking No',
      dataIndex: 'bookingNo',
      key: 'bookingNo',

      render: (_: any, record: Booking) =>
        canViewAuthForm ? (
          <Link
            href={`/dashboard/booking/authform/${record._id}`}
            className="font-medium text-blue-600 hover:underline"
          >
            {record.bookingNo}
          </Link>
        ) : (
          <span className="font-medium text-slate-700">{record.bookingNo}</span>
        ),
    },
    /*
    |--------------------------------------------------------------------------
    | Customer
    |--------------------------------------------------------------------------
    */

    {
      title: 'Customer',
      key: 'customer',

      render: (_: any, record: Booking) => record.customer?.name || '-',
    },

    /*
    |--------------------------------------------------------------------------
    | Mobile
    |--------------------------------------------------------------------------
    */

    {
      title: 'Mobile',
      key: 'mobile',

      render: (_: any, record: Booking) => record.customer?.mobile || '-',
    },

    /*
    |--------------------------------------------------------------------------
    | Email
    |--------------------------------------------------------------------------
    */

    {
      title: 'Email',
      key: 'email',

      render: (_: any, record: Booking) => record.customer?.email || '-',
    },

    /*
    |--------------------------------------------------------------------------
    | Journey
    |--------------------------------------------------------------------------
    */

    {
      title: 'Journey',
      key: 'journey',

      render: (_: any, record: Booking) =>
        `${record.journey?.fromCity || '-'} → ${record.journey?.toCity || '-'}`,
    },

    /*
    |--------------------------------------------------------------------------
    | Service
    |--------------------------------------------------------------------------
    */

    {
      title: 'Service',
      dataIndex: 'service',
      key: 'service',

      render: (service: string) => <Tag color="blue">{service}</Tag>,
    },

    /*
    |--------------------------------------------------------------------------
    | Created By
    |--------------------------------------------------------------------------
    */

    {
      title: 'Created By',
      key: 'createdBy',

      render: (_: any, record: Booking) => record.createdBy?.name || '-',
    },

    /*
    |--------------------------------------------------------------------------
    | Created Date
    |--------------------------------------------------------------------------
    */

    {
      title: 'Created Date',
      dataIndex: 'createdAt',
      key: 'createdAt',

      render: (createdAt: string) => (createdAt ? dayjs(createdAt).format('DD MMM YYYY') : '-'),
    },

    /*
    |--------------------------------------------------------------------------
    | Status
    |--------------------------------------------------------------------------
    */

    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',

      render: (status: keyof typeof statusColor) => (
        <Badge color={statusColor[status]} text={status.replace(/_/g, ' ')} />
      ),
    },

    /*
    |--------------------------------------------------------------------------
    | Actions
    |--------------------------------------------------------------------------
    */

    {
      title: '',
      key: 'action',
      width: 60,
      align: 'center' as const,

      render: (_: any, record: Booking) => {
        const items: any[] = [];

        /*
        |--------------------------------------------------------------------------
        | View Auth Form
        |--------------------------------------------------------------------------
        */

        if (canViewAuthForm) {
          items.push({
            key: 'view',
            icon: <EyeOutlined />,

            label: <Link href={`/dashboard/booking/authform/${record._id}`}>View</Link>,
          });
        }

        /*
        |--------------------------------------------------------------------------
        | Edit
        |--------------------------------------------------------------------------
        */

        if (canEdit) {
          items.push({
            key: 'edit',
            icon: <EditOutlined />,

            label: (
              <span
                onClick={() => {
                  onEdit(record);
                }}
              >
                Edit
              </span>
            ),
          });
        }

        /*
        |--------------------------------------------------------------------------
        | Delete
        |--------------------------------------------------------------------------
        */

        if (canDelete) {
          if (items.length > 0) {
            items.push({
              type: 'divider',
            });
          }

          items.push({
            key: 'delete',
            danger: true,
            icon: <DeleteOutlined />,

            label: (
              <span
                onClick={() => {
                  onDelete?.(record);
                }}
              >
                Delete
              </span>
            ),
          });
        }

        /*
        |--------------------------------------------------------------------------
        | No Action Permission
        |--------------------------------------------------------------------------
        */

        if (items.length === 0) {
          return null;
        }

        /*
        |--------------------------------------------------------------------------
        | Dropdown
        |--------------------------------------------------------------------------
        */

        return (
          <Dropdown
            trigger={['click']}
            menu={{
              items,
            }}
          >
            <Button type="text" size="small" icon={<MoreOutlined />} />
          </Dropdown>
        );
      },
    },
  ];
};
