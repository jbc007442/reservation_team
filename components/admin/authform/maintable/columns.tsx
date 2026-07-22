'use client';

import dayjs from 'dayjs';
import { Badge, Tag } from 'antd';

import ActionMenu from './ActionMenu';
import { AuthForm } from './types';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'approved':
      return 'green';

    case 'rejected':
      return 'red';

    case 'sent':
      return 'blue';

    case 'opened':
      return 'cyan';

    case 'submitted':
      return 'gold';

    case 'expired':
      return 'volcano';

    default:
      return 'default';
  }
};

export const authFormColumns = [
  {
    title: 'Booking No',
    key: 'bookingNo',
    width: 140,

    render: (_: any, record: AuthForm) => record.bookingId?.bookingNo,
  },

  {
    title: 'Customer',
    key: 'customer',
    width: 220,

    render: (_: any, record: AuthForm) => (
      <>
        <div style={{ fontWeight: 600 }}>{record.bookingId?.customer?.name}</div>

        <div style={{ color: '#888', fontSize: 12 }}>{record.bookingId?.customer?.email}</div>
      </>
    ),
  },

  {
    title: 'Booking Type',
    dataIndex: 'bookingType',
    width: 140,
  },

  {
    title: 'Service Type',
    dataIndex: 'serviceType',
    width: 140,
  },

  {
    title: 'IP Address',
    width: 180,

    render: (_: any, record: AuthForm) => (
      <Badge
        status={record.approval?.approvedBy?.ipAddress ? 'processing' : 'default'}
        text={record.approval?.approvedBy?.ipAddress || '-'}
      />
    ),
  },

  {
    title: 'Status',
    width: 140,

    render: (_: any, record: AuthForm) => (
      <Tag color={getStatusColor(record.approval.status)}>
        {record.approval.status.toUpperCase()}
      </Tag>
    ),
  },

  {
    title: 'Created',
    width: 180,

    render: (_: any, record: AuthForm) => dayjs(record.createdAt).format('DD MMM YYYY'),
  },

  {
    title: 'Action',
    width: 80,

    render: (_: any, record: AuthForm) => {
      console.log('Record:', record);
      console.log('_id:', record._id);
      console.log('id:', (record as any).id);

      return <ActionMenu id={record._id as any} />;
    },
  },

  // {
  //   title: 'Action',
  //   width: 80,

  //   render: (_: any, record: AuthForm) => <ActionMenu id={record._id} />,
  // },
];
