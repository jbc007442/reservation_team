'use client';

import { useEffect, useState } from 'react';
import { Button, Card, Col, Row, Statistic, Space, Typography, message } from 'antd';
import {
  PlusOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';

import BookingDialog from '@/components/admin/booking/BookingDialog';
import BookingTable from '@/components/admin/booking/BookingTable';

import { Booking } from '@/components/user/booking/types';

const { Title, Text } = Typography;

interface BookingStats {
  total: number;
  bookingCreated: number;
  authPending: number;
  authCompleted: number;
  ticketed: number;
  cancelled: number;
  refunded: number;
  chargeBack: number;
  followUp: number;
  cardCharged: number;
  cardDecline: number;
}

export default function BookingsPage() {
  const [open, setOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const [stats, setStats] = useState<BookingStats>({
    total: 0,
    bookingCreated: 0,
    authPending: 0,
    authCompleted: 0,
    ticketed: 0,
    cancelled: 0,
    refunded: 0,
    chargeBack: 0,
    followUp: 0,
    cardCharged: 0,
    cardDecline: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/booking');

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message);
      }

      setStats(result.stats);
    } catch (err: any) {
      message.error(err.message);
    }
  };

  const handleAddBooking = () => {
    setSelectedBooking(null);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedBooking(null);
    fetchStats();
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <Title level={3} className="!mb-0">
              Flight Bookings
            </Title>

            <Text type="secondary">Manage flight enquiries and bookings.</Text>
          </div>

          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddBooking}>
              New Booking
            </Button>
          </Space>
        </div>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8} lg={6} xl={4}>
          <Card hoverable>
            <Statistic title="Total Bookings" value={stats.total} prefix={<CalendarOutlined />} />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8} lg={6} xl={4}>
          <Card hoverable>
            <Statistic
              title="Booking Created"
              value={stats.bookingCreated}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#1677ff' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8} lg={6} xl={4}>
          <Card hoverable>
            <Statistic
              title="Auth Pending"
              value={stats.authPending}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8} lg={6} xl={4}>
          <Card hoverable>
            <Statistic
              title="Auth Completed"
              value={stats.authCompleted}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8} lg={6} xl={4}>
          <Card hoverable>
            <Statistic
              title="Ticketed"
              value={stats.ticketed}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#389e0d' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8} lg={6} xl={4}>
          <Card hoverable>
            <Statistic
              title="Card Charged"
              value={stats.cardCharged}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8} lg={6} xl={4}>
          <Card hoverable>
            <Statistic
              title="Card Declined"
              value={stats.cardDecline}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8} lg={6} xl={4}>
          <Card hoverable>
            <Statistic
              title="Refunded"
              value={stats.refunded}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#13c2c2' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8} lg={6} xl={4}>
          <Card hoverable>
            <Statistic
              title="Charge Back"
              value={stats.chargeBack}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: '#fa541c' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8} lg={6} xl={4}>
          <Card hoverable>
            <Statistic
              title="Follow Up"
              value={stats.followUp}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#d4b106' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8} lg={6} xl={4}>
          <Card hoverable>
            <Statistic
              title="Cancelled"
              value={stats.cancelled}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      <Card styles={{ body: { padding: 0 } }}>
        <BookingTable />
      </Card>

      <BookingDialog open={open} onClose={handleClose} booking={selectedBooking} />
    </div>
  );
}