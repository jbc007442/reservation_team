'use client';

import { useEffect, useState } from 'react';
import { Card, Col, Row, Skeleton, Statistic } from 'antd';
import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  RiseOutlined,
} from '@ant-design/icons';

export interface StatCard {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

interface DashboardStats {
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

  revenue: {
    totalCharges: number;
    taxesAndFee: number;
    netGross: number;
    netProfit: number;
  };
}

export default function StatsCards() {
  const [stats, setStats] = useState<StatCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);

      const response = await fetch('/api/dashboard/stats');

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard statistics');
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch dashboard statistics');
      }

      const data: DashboardStats = result.data;

      setStats([
        {
          title: 'Booking Created',
          value: data.bookingCreated,
          icon: <CalendarOutlined />,
          color: '#1677ff',
        },
        {
          title: 'Auth Pending',
          value: data.authPending,
          icon: <ClockCircleOutlined />,
          color: '#faad14',
        },
        {
          title: 'Auth Completed',
          value: data.authCompleted,
          icon: <CheckCircleOutlined />,
          color: '#52c41a',
        },
        {
          title: 'Ticketed',
          value: data.ticketed,
          icon: <CheckCircleOutlined />,
          color: '#389e0d',
        },
        {
          title: 'Card Charged',
          value: data.cardCharged,
          icon: <CheckCircleOutlined />,
          color: '#16a34a',
        },
        {
          title: 'Card Declined',
          value: data.cardDecline,
          icon: <CloseCircleOutlined />,
          color: '#cf1322',
        },
        {
          title: 'Refunded',
          value: data.refunded,
          icon: <CheckCircleOutlined />,
          color: '#13c2c2',
        },
        {
          title: 'Charge Back',
          value: data.chargeBack,
          icon: <CloseCircleOutlined />,
          color: '#fa541c',
        },
        {
          title: 'Follow Up',
          value: data.followUp,
          icon: <ClockCircleOutlined />,
          color: '#d4b106',
        },
        {
          title: 'Cancelled',
          value: data.cancelled,
          icon: <CloseCircleOutlined />,
          color: '#ff4d4f',
        },
        {
          title: 'Net Gross',
          value: data.revenue.netGross,
          icon: <RiseOutlined />,
          color: '#722ed1',
        },
      ]);
    } catch (error) {
      console.error('Dashboard stats error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Row gutter={[16, 16]}>
      {(loading ? Array.from({ length: 11 }) : stats).map((item, index) => (
        <Col xs={24} sm={12} md={8} lg={6} xl={4} key={loading ? index : (item as StatCard).title}>
          <Card hoverable>
            {loading ? (
              <Skeleton active paragraph={{ rows: 1 }} />
            ) : (
              <Statistic
                title={(item as StatCard).title}
                value={(item as StatCard).value}
                prefix={(item as StatCard).icon}
                styles={{
                  content: {
                    color: (item as StatCard).color,
                  },
                }}
              />
            )}
          </Card>
        </Col>
      ))}
    </Row>
  );
}
