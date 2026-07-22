'use client';

import { useEffect, useState } from 'react';
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
import { Booking } from '@/components/admin/booking/types';

const { Text } = Typography;

type UserRole = 'admin' | 'employee';

interface PaymentItem {
  key: string;
  cardEnding: string;
  cardHolder: string;
  amount: number;
  transactionId: string;
  status: 'Pending' | 'Approved';
}

interface ChargeItem {
  description: string;
  amount: number;
  currency: string;
}

interface BillingProps {
  booking: Booking;
}

export default function Billing({ booking }: BillingProps) {
  const { user } = useAuthStore();
  const role = (user?.role as UserRole) || 'employee';

  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [charges, setCharges] = useState<ChargeItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [bookingInfo, setBookingInfo] = useState({
    bookingReferenceNo: '',
    customer: '',
  });

  useEffect(() => {
    loadPayments();
  }, [booking._id]);

  const loadPayments = async () => {
    try {
      setLoading(true);

      const res = await fetch(`/api/authform/billing/${booking._id}`);

      const result = await res.json();

      if (!result.success) {
        message.error(result.message);
        return;
      }

      setBookingInfo({
        bookingReferenceNo: result.data.bookingReferenceNo || '',
        customer: result.data.customer
          ? `${result.data.customer.title} ${result.data.customer.firstName} ${result.data.customer.lastName}`
          : '',
      });

      setCharges(
        (result.data.charges || []).map((charge: any) => ({
          description: charge.description,
          amount: Number(charge.amount || 0),
          currency: charge.currency || 'USD',
        }))
      );

      const rows: PaymentItem[] = (result.data.cards || []).map((card: any, index: number) => ({
        key: String(index),

        cardEnding: card.cardNumber ? `****${card.cardNumber.slice(-4)}` : '-',

        cardHolder: card.cardHolderName || '-',

        amount: Number(card.amount || 0),

        transactionId: card.transactionId || '',

        status: card.paymentStatus || 'Pending',
      }));

      setPayments(rows);
    } catch (err) {
      console.error(err);
      message.error('Failed to load payment details.');
    } finally {
      setLoading(false);
    }
  };

  const total = charges.reduce((sum, item) => sum + item.amount, 0);

  const approved = payments
    .filter((item) => item.status === 'Approved')
    .reduce((sum, item) => sum + item.amount, 0);

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

  const saveTransaction = async (key: string) => {
    try {
      const updatedPayments = payments.map((item) =>
        item.key === key
          ? {
              ...item,
              status: (item.transactionId ? 'Approved' : 'Pending') as 'Pending' | 'Approved',
            }
          : item
      );

      setPayments(updatedPayments);

      const res = await fetch(`/api/authform/billing/${booking._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cards: updatedPayments,
          userId: user?._id,
        }),
      });

      const result = await res.json();

      if (result.success) {
        message.success(result.message);
      } else {
        message.error(result.message);
      }
    } catch (err) {
      console.error(err);
      message.error('Failed to update payment.');
    }
  };

  const chargeColumns = [
    {
      title: 'Description',
      dataIndex: 'description',
    },
    {
      title: 'Amount',
      render: (_: any, record: ChargeItem) => `$${record.amount.toLocaleString()}`,
    },
    {
      title: 'Currency',
      dataIndex: 'currency',
    },
  ];

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
      render: (_: any, record: PaymentItem) => `$${record.amount.toLocaleString()}`,
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
      loading={loading}
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
        <Descriptions.Item label="Booking ID">
          {bookingInfo.bookingReferenceNo || booking.bookingNo}
        </Descriptions.Item>

        <Descriptions.Item label="Customer">{bookingInfo.customer || '-'}</Descriptions.Item>

        <Descriptions.Item label="Payment Status">
          <Tag color={balance === 0 ? 'green' : 'orange'}>
            {balance === 0 ? 'Approved' : 'Pending'}
          </Tag>
        </Descriptions.Item>

        <Descriptions.Item label="Cards">{payments.length}</Descriptions.Item>
      </Descriptions>

      <Divider>Charges</Divider>

      <Table rowKey="description" pagination={false} columns={chargeColumns} dataSource={charges} />

      <Divider>Payment Cards</Divider>

      <Table rowKey="key" pagination={false} columns={columns} dataSource={payments} />

      <Divider />

      <div
        style={{
          maxWidth: 350,
          marginLeft: 'auto',
        }}
      >
        <Descriptions bordered column={1} size="small">
          <Descriptions.Item label="Total Charges">${total.toLocaleString()}</Descriptions.Item>

          <Descriptions.Item label="Approved Amount">
            <Text type="success">${approved.toLocaleString()}</Text>
          </Descriptions.Item>

          <Descriptions.Item label="Remaining Balance">
            <Text type={balance === 0 ? 'success' : 'warning'}>${balance.toLocaleString()}</Text>
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
