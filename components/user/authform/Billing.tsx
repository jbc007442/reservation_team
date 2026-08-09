'use client';

import { useEffect, useState } from 'react';
import { Card, Divider, Table, Tag, Typography, Descriptions, message, Space, Button } from 'antd';
import {
  CheckCircleOutlined,
  CreditCardOutlined,
  FilePdfOutlined,
  MailOutlined,
} from '@ant-design/icons';

import { Booking } from '@/components/user/booking/types';

const { Text } = Typography;

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
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [cards, setCards] = useState<CardItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [bookingInfo, setBookingInfo] = useState({
    bookingReferenceNo: '',
    customer: '',
  });

  useEffect(() => {
    loadBilling();
  }, [booking._id]);

  const loadBilling = async () => {
    try {
      setLoading(true);

      const res = await fetch(`/api/authform/billing/${booking._id}`);

      const result = await res.json();

      if (!result.data) {
        setBookingInfo({
          bookingReferenceNo: booking.bookingNo,
          customer: '',
        });

        setPayments([]);
        setCards([]);
        return;
      }

      // -----------------------------
      // Booking Information
      // -----------------------------

      setBookingInfo({
        bookingReferenceNo: result.data.bookingReferenceNo || booking.bookingNo,

        customer: result.data.customer
          ? `${result.data.customer.title || ''} ${result.data.customer.firstName || ''} ${
              result.data.customer.lastName || ''
            }`.trim()
          : '',
      });

      // -----------------------------
      // Charges
      // -----------------------------

      const rows: PaymentItem[] = (result.data.charges || []).map((charge: any, index: number) => ({
        key: String(index),
        description: charge.description || '-',
        amount: Number(charge.amount || 0),
        currency: charge.currency || 'USD',
        transactionId: charge.transactionId || '',
        status: charge.paymentStatus || 'Pending',
      }));

      setPayments(rows);

      // -----------------------------
      // Card Information
      // -----------------------------

      const cardRows: CardItem[] = (result.data.cards || []).map((card: any, index: number) => ({
        key: String(index),
        cardType: card.cardType || '-',
        cardHolderName: card.cardHolderName || '-',
        cardNumber: card.cardNumber || '',
        expiryDate: card.expiryDate || '-',
        cvv: card.cvv || '',
        contactNumber: card.contactNumber || '-',
        billingAddress: card.billingAddress || '-',
      }));

      setCards(cardRows);
    } catch (err) {
      console.error(err);
      message.error('Failed to load billing details.');
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // Payment Calculations
  // -----------------------------

  const total = payments.reduce((sum, item) => sum + item.amount, 0);

  const approved = payments
    .filter((item) => item.status === 'Approved')
    .reduce((sum, item) => sum + item.amount, 0);

  const balance = total - approved;

  const paymentApproved =
    payments.length > 0 && balance === 0 && payments.every((item) => item.status === 'Approved');

  // -----------------------------
  // Payment Columns - READ ONLY
  // -----------------------------

  const paymentColumns = [
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
      render: (_: any, record: PaymentItem) => record.transactionId || '-',
    },

    {
      title: 'Status',
      render: (_: any, record: PaymentItem) => (
        <Tag color={record.status === 'Approved' ? 'green' : 'orange'}>{record.status}</Tag>
      ),
    },
  ];

  // -----------------------------
  // Card Columns - READ ONLY
  // -----------------------------

  const cardColumns = [
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
      render: (_: any, record: CardItem) =>
        record.cardNumber ? `•••• •••• •••• ${record.cardNumber.slice(-4)}` : '-',
    },

    {
      title: 'Expiry',
      dataIndex: 'expiryDate',
    },

    {
      title: 'CVV',
      render: () => '•••',
    },
  ];

  return (
    <Card
      loading={loading}
      title="Payment & Billing"
      extra={
        <Space>
          <Button icon={<FilePdfOutlined />}>Download PDF</Button>

          <Button type="primary" icon={<MailOutlined />}>
            Send Receipt
          </Button>
        </Space>
      }
    >
      {/* Booking Information */}

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

      {/* Payment Details */}

      <Divider>Payment Details</Divider>

      <Table rowKey="key" pagination={false} columns={paymentColumns} dataSource={payments} />

      {/* Card Information */}

      <Divider>
        <Space>
          <CreditCardOutlined />
          Card Information
        </Space>
      </Divider>

      <Table rowKey="key" pagination={false} columns={cardColumns} dataSource={cards} />

      {/* Payment Summary */}

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