'use client';

import { useState } from 'react';
import {
  Button,
  Card,
  Divider,
  Input,
  Space,
  Table,
  Tag,
  Typography,
  Descriptions,
  message,
} from 'antd';
import {
  CheckCircleOutlined,
  FilePdfOutlined,
  MailOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '@/store/authStore';

const { Text } = Typography;

import { Booking } from '@/components/user/booking/types';

type UserRole = 'admin' | 'employee';

interface PaymentItem {
  key: string;
  cardEnding: string;
  cardHolder: string;
  amount: number;
  transactionId: string;
  status: 'Pending' | 'Approved';
}



interface BillingProps {
  booking: Booking;
}

export default function Billing({ booking }: BillingProps) {
  // TODO: Replace with logged in user role
  const { user } = useAuthStore();
  const role = user?.role || 'employee';

  const [payments, setPayments] = useState<PaymentItem[]>([
    {
      key: '1',
      cardEnding: '****4589',
      cardHolder: 'Mr. Chaman',
      amount: 30000,
      transactionId: '',
      status: 'Pending',
    },
    {
      key: '2',
      cardEnding: '****9632',
      cardHolder: 'Mr. Chaman',
      amount: 24250,
      transactionId: 'TXN8743892748327',
      status: 'Approved',
    },
  ]);

  const total = payments.reduce((a, b) => a + b.amount, 0);

  const approved = payments
    .filter((p) => p.status === 'Approved')
    .reduce((a, b) => a + b.amount, 0);

  const balance = total - approved;

  const handleTransactionChange = (key: string, value: string) => {
    setPayments((prev) =>
      prev.map((item) =>
        item.key === key
          ? {
              ...item,
              transactionId: value,
            }
          : item
      )
    );
  };

  const saveTransaction = (key: string) => {
    setPayments((prev) =>
      prev.map((item) =>
        item.key === key
          ? {
              ...item,
              status: item.transactionId ? 'Approved' : 'Pending',
            }
          : item
      )
    );

    message.success('Transaction updated successfully');
  };

  const columns = [
    {
      title: 'Card',
      dataIndex: 'cardEnding',
    },
    {
      title: 'Card Holder',
      dataIndex: 'cardHolder',
    },
    {
      title: 'Amount',
      render: (_: any, record: PaymentItem) => `₹${record.amount.toLocaleString()}`,
    },
    {
      title: 'Transaction ID',
      render: (_: any, record: PaymentItem) =>
        role === 'admin' ? (
          <Input
            value={record.transactionId}
            placeholder="Enter Transaction ID"
            onChange={(e) => handleTransactionChange(record.key, e.target.value)}
          />
        ) : (
          <Text>{record.transactionId || '-'}</Text>
        ),
    },
    {
      title: 'Status',
      render: (_: any, record: PaymentItem) => (
        <Tag color={record.status === 'Approved' ? 'green' : 'orange'}>{record.status}</Tag>
      ),
    },
    ...(role === 'admin'
      ? [
          {
            title: 'Action',
            render: (_: any, record: PaymentItem) => (
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={() => saveTransaction(record.key)}
              >
                Save
              </Button>
            ),
          },
        ]
      : []),
  ];

  return (
    <Card
      title="Payment Verification"
      extra={
        <Space>
          <Button icon={<FilePdfOutlined />}>Download PDF</Button>

          <Button type="primary" icon={<MailOutlined />}>
            Send Receipt
          </Button>
        </Space>
      }
    >
      <Descriptions bordered column={2}>
        <Descriptions.Item label="Booking ID">BK000123</Descriptions.Item>

        <Descriptions.Item label="Customer">Mr. Chaman</Descriptions.Item>

        <Descriptions.Item label="Payment Status">
          <Tag color={balance === 0 ? 'green' : 'orange'}>
            {balance === 0 ? 'Approved' : 'Pending'}
          </Tag>
        </Descriptions.Item>

        <Descriptions.Item label="Cards">{payments.length}</Descriptions.Item>
      </Descriptions>

      <Divider />

      <Table rowKey="key" pagination={false} columns={columns} dataSource={payments} />

      <Divider />

      <div
        style={{
          maxWidth: 350,
          marginLeft: 'auto',
        }}
      >
        <Descriptions bordered column={1} size="small">
          <Descriptions.Item label="Total Charges">₹{total.toLocaleString()}</Descriptions.Item>

          <Descriptions.Item label="Approved Amount">
            <Text type="success">₹{approved.toLocaleString()}</Text>
          </Descriptions.Item>

          <Descriptions.Item label="Remaining Balance">
            <Text type="warning">₹{balance.toLocaleString()}</Text>
          </Descriptions.Item>

          <Descriptions.Item label="Overall Status">
            {balance === 0 ? (
              <Tag color="green" icon={<CheckCircleOutlined />}>
                Payment Approved
              </Tag>
            ) : (
              <Tag color="orange">Pending Verification</Tag>
            )}
          </Descriptions.Item>
        </Descriptions>
      </div>
    </Card>
  );
}
