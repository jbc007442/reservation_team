'use client';

import Link from 'next/link';
import { createElement } from 'react';
import { EyeOutlined, EditOutlined, DeleteOutlined, MoreOutlined } from '@ant-design/icons';
import { Badge, Tag, Button, Dropdown } from 'antd';

import { Booking } from './types';

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

export const bookingColumns = ({ onEdit, onDelete }: BookingColumnsProps) => [
  {
    title: 'Booking No',
    dataIndex: 'bookingNo',
    key: 'bookingNo',
    render: (_: any, record: Booking) =>
      createElement(
        Link,
        {
          href: `/admin/booking/authform/${record._id}`,
          className: 'text-blue-600 hover:underline font-medium',
        },
        record.bookingNo
      ),
  },

  {
    title: 'Customer',
    key: 'customer',
    render: (_: any, record: Booking) => record.customer?.name || '-',
  },

  {
    title: 'Mobile',
    key: 'mobile',
    render: (_: any, record: Booking) => record.customer?.mobile || '-',
  },

  {
    title: 'Email',
    key: 'email',
    render: (_: any, record: Booking) => record.customer?.email || '-',
  },

  {
    title: 'Journey',
    key: 'journey',
    render: (_: any, record: Booking) =>
      `${record.journey?.fromCity || '-'} → ${record.journey?.toCity || '-'}`,
  },

  {
    title: 'Service',
    dataIndex: 'service',
    key: 'service',
    render: (service: string) => <Tag color="blue">{service}</Tag>,
  },

  {
    title: 'Created By',
    key: 'createdBy',
    render: (_: any, record: Booking) => record.createdBy?.name || '-',
  },

  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: (status: keyof typeof statusColor) => (
      <Badge color={statusColor[status]} text={status.replace(/_/g, ' ')} />
    ),
  },

  {
    title: '',
    key: 'action',
    width: 60,
    align: 'center' as const,
    render: (_: any, record: Booking) => (
      <Dropdown
        trigger={['click']}
        menu={{
          items: [
            {
              key: 'view',
              icon: <EyeOutlined />,
              label: <Link href={`/admin/booking/authform/${record._id}`}>View</Link>,
            },
            {
              key: 'edit',
              icon: <EditOutlined />,
              label: <span onClick={() => onEdit(record)}>Edit</span>,
            },
            {
              type: 'divider',
            },
            {
              key: 'delete',
              danger: true,
              icon: <DeleteOutlined />,
              label: (
                <span
                  onClick={() => {
                    if (onDelete) onDelete(record);
                  }}
                >
                  Delete
                </span>
              ),
            },
          ],
        }}
      >
        <Button type="text" size="small" icon={<MoreOutlined />} />
      </Dropdown>
    ),
  },
];