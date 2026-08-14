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
  Segmented,
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
  description: string;
  amount: number;
  currency: string;
  transactionId: string;
  status: 'Pending' | 'Approved';
}

interface CardItem {
  key: string;
  cardType: string;
  paymentLink?: string;

  cardHolderName: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  contactNumber: string;
  billingAddress: string;
}

interface BillingProps {
  booking: Booking;
}

export default function Billing({ booking }: BillingProps) {
  const { user } = useAuthStore();
  const role = (user?.role as UserRole) || 'employee';

  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [cards, setCards] = useState<CardItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [bookingInfo, setBookingInfo] = useState({
    bookingReferenceNo: '',
    customer: '',
  });

  const [currentStatus, setCurrentStatus] = useState<string>(booking.status || '');

  const hasPaymentLink = cards.some((card) => card.cardType === 'other');

  useEffect(() => {
    loadPayments();
  }, [booking._id]);

  const loadPayments = async () => {
    try {
      setLoading(true);

      const res = await fetch(`/api/authform/billing/${booking._id}`);
      const result = await res.json();

      // No AuthForm/Billing created yet
      if (!result.data) {
        setBookingInfo({
          bookingReferenceNo: booking.bookingNo,
          customer: '',
        });

        setPayments([]);
        setCards([]);
        return;
      }

      // Existing Billing
      setBookingInfo({
        bookingReferenceNo: result.data.bookingReferenceNo || '',
        customer: result.data.customer
          ? `${result.data.customer.title} ${result.data.customer.firstName} ${result.data.customer.lastName}`
          : '',
      });

      const rows: PaymentItem[] = (result.data.charges || []).map((charge: any, index: number) => ({
        key: String(index),
        description: charge.description,
        amount: Number(charge.amount || 0),
        currency: charge.currency || 'USD',
        transactionId: charge.transactionId || '',
        status: charge.paymentStatus || 'Pending',
      }));

      setPayments(rows);

      const cardRows: CardItem[] = (result.data.cards || []).map((card: any, index: number) => ({
        key: String(index),
        cardType: card.cardType || '',
        paymentLink: card.paymentLink || '',
        cardHolderName: card.cardHolderName || '',
        cardNumber: card.cardNumber || '',
        expiryDate: card.expiryDate || '',
        cvv: card.cvv || '',
        contactNumber: card.contactNumber || '',
        billingAddress: card.billingAddress || '',
      }));

      setCards(cardRows);
    } catch (err) {
      console.error(err);
      message.error('Failed to load payment details.');
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (status: string) => {
    try {
      const res = await fetch(`/api/authform/booking/status/${booking._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message);
      }

      setCurrentStatus(status);

      message.success('Booking status updated.');
    } catch (err: any) {
      message.error(err.message);
    }
  };

  const total = payments.reduce((sum, item) => sum + item.amount, 0);

  const approved = payments
    .filter((item) => item.status === 'Approved')
    .reduce((sum, item) => sum + item.amount, 0);

  const balance = total - approved;

  const paymentApproved =
    payments.length > 0 && balance === 0 && payments.every((item) => item.status === 'Approved');

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

  const saveTransaction = async (record: PaymentItem) => {
    try {
      const status: 'Pending' | 'Approved' = record.transactionId.trim() ? 'Approved' : 'Pending';

      // Update UI immediately
      setPayments((prev) =>
        prev.map((item) =>
          item.key === record.key
            ? {
                ...item,
                status,
              }
            : item
        )
      );

      const res = await fetch(`/api/authform/billing/${booking._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chargeIndex: Number(record.key),
          transactionId: record.transactionId,
          status,
          userId: user?._id,
        }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || 'Failed to update payment.');
      }

      message.success(result.message);

      // Reload latest data
      loadPayments();
    } catch (err: any) {
      console.error(err);
      loadPayments(); // restore latest values from database
      message.error(err.message || 'Failed to update payment.');
    }
  };

  const columns = [
    {
      title: 'Charge',
      dataIndex: 'description',
    },
    {
      title: 'Amount',
      render: (_: any, record: PaymentItem) => `$${record.amount.toLocaleString()}`,
    },
    {
      title: 'Currency',
      dataIndex: 'currency',
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
    {
      title: 'Action',
      render: (_: any, record: PaymentItem) =>
        role === 'admin' ? (
          <Button
            type="primary"
            icon={<SaveOutlined />}
            disabled={!record.transactionId.trim()}
            onClick={() => saveTransaction(record)}
          >
            Save
          </Button>
        ) : (
          '-'
        ),
    },
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
          <Tag color={paymentApproved ? 'green' : 'orange'}>
            {paymentApproved ? 'Approved' : 'Pending'}
          </Tag>
        </Descriptions.Item>

        <Descriptions.Item label="Charges">{payments.length}</Descriptions.Item>
      </Descriptions>

      <Divider>Payment Verification</Divider>

      <Table rowKey="key" pagination={false} columns={columns} dataSource={payments} />

      <Divider>Booking Status</Divider>

      <Segmented
        block
        value={currentStatus}
        onChange={(value) => updateBookingStatus(value as string)}
        options={[
          {
            label: 'Cancelled',
            value: 'cancelled',
          },
          {
            label: 'Refunded',
            value: 'refunded',
          },
          {
            label: 'Charge Back',
            value: 'charge_back',
          },
          {
            label: 'Card Declined',
            value: 'card_decline',
          },
        ]}
      />

      <Divider>Card/Payment Information</Divider>

      <Table
        rowKey="key"
        pagination={false}
        dataSource={cards}
        columns={
          hasPaymentLink
            ? [
                {
                  title: 'Card Type',
                  dataIndex: 'cardType',
                  render: (value: string) =>
                    value === 'other' ? 'Payment Link' : value.toUpperCase(),
                },
                {
                  title: 'Payment Link',
                  dataIndex: 'paymentLink',
                  render: (value: string) =>
                    value ? (
                      <a href={value} target="_blank" rel="noreferrer">
                        {value}
                      </a>
                    ) : (
                      '-'
                    ),
                },
              ]
            : [
                {
                  title: 'Card Type',
                  dataIndex: 'cardType',
                },
                {
                  title: 'Card Holder',
                  dataIndex: 'cardHolderName',
                },
                {
                  title: 'Card Number',
                  dataIndex: 'cardNumber',
                },
                {
                  title: 'CVV',
                  dataIndex: 'cvv',
                },
                {
                  title: 'Expiry',
                  dataIndex: 'expiryDate',
                },
              ]
        }
      />

      <div
        style={{
          maxWidth: 350,
          marginLeft: 'auto',
          marginTop: 25,
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
            {paymentApproved ? (
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
