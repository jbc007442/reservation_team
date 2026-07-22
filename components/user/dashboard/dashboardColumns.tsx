'use client';

import type { ColumnsType } from 'antd/es/table';
import { Tag, Button, Space } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

import DragHandle from '@/components/shared/table/DragHandle';

export interface Booking {
  id: string;
  customer: string;
  destination: string;
  bookingDate: string;
  amount: number;
  status: 'Confirmed' | 'Pending' | 'Cancelled';
}

export const bookingColumns: ColumnsType<Booking> = [
  {
    title: '',
    width: 50,
    render: (_, record) => <DragHandle id={record.id} />,
  },
  {
    title: 'Customer',
    dataIndex: 'customer',
  },
  {
    title: 'Destination',
    dataIndex: 'destination',
  },
  {
    title: 'Booking Date',
    dataIndex: 'bookingDate',
  },
  {
    title: 'Amount',
    dataIndex: 'amount',
    render: (value: number) => <>₹{value.toLocaleString()}</>,
  },
  {
    title: 'Status',
    dataIndex: 'status',
    render: (status: Booking['status']) => {
      const color = status === 'Confirmed' ? 'green' : status === 'Pending' ? 'orange' : 'red';

      return <Tag color={color}>{status}</Tag>;
    },
  },
  {
    title: 'Action',
    render: () => (
      <Space>
        <Button size="small" icon={<EditOutlined />} />
        <Button danger size="small" icon={<DeleteOutlined />} />
      </Space>
    ),
  },
];
