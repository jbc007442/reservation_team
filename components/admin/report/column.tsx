import { Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';

import type { ReportData } from './types';

export const reportColumns: ColumnsType<ReportData> = [
  {
    title: 'Booking No',
    dataIndex: 'bookingNo',
    key: 'bookingNo',
    width: 140,
    fixed: 'left',
  },

  {
    title: 'Customer Name',
    dataIndex: 'customerName',
    key: 'customerName',
    width: 220,
  },

  {
    title: 'Created By',
    dataIndex: 'createdBy',
    key: 'createdBy',
    width: 160,
  },

  {
    title: 'Service',
    dataIndex: 'service',
    key: 'service',
    width: 140,
  },

  {
    title: 'Service Type',
    dataIndex: 'serviceType',
    key: 'serviceType',
    width: 200,
  },

  {
    title: 'Merchant',
    dataIndex: 'merchant',
    key: 'merchant',
    width: 120,
    align: 'center',
    render: (merchant: string) => <Tag color="blue">{merchant || '--'}</Tag>,
  },

  {
    title: 'Amount',
    dataIndex: 'amount',
    key: 'amount',
    width: 120,
    align: 'right',
    render: (amount: number) => `$${Number(amount || 0).toFixed(2)}`,
  },

  {
    title: 'Payment',
    dataIndex: 'paymentStatus',
    key: 'paymentStatus',
    width: 130,
    align: 'center',
    render: (status: ReportData['paymentStatus']) => {
      const color = status === 'paid' ? 'success' : status === 'partial' ? 'warning' : 'default';

      return <Tag color={color}>{status.toUpperCase()}</Tag>;
    },
  },

  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    width: 160,
    align: 'center',
    render: (status: ReportData['status']) => {
      const labels: Record<ReportData['status'], string> = {
        booking_created: 'Booking Created',
        auth_pending: 'Auth Pending',
        auth_completed: 'Auth Completed',
        ticketed: 'Ticketed',
        cancelled: 'Cancelled',
        refunded: 'Refunded',
        charge_back: 'Charge Back',
        follow_up: 'Follow Up',
        card_charged: 'Card Charged',
        card_decline: 'Card Decline',
      };

      const colors: Record<ReportData['status'], string> = {
        booking_created: 'blue',
        auth_pending: 'orange',
        auth_completed: 'cyan',
        ticketed: 'green',
        cancelled: 'red',
        refunded: 'purple',
        charge_back: 'volcano',
        follow_up: 'gold',
        card_charged: 'green',
        card_decline: 'red',
      };

      return <Tag color={colors[status] || 'default'}>{labels[status] || status}</Tag>;
    },
  },
];
