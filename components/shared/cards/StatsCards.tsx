'use client';

import { useEffect, useState } from 'react';
import { Card, Col, Row, Skeleton, Typography } from 'antd';
import { CalendarOutlined, RiseOutlined, WalletOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export interface StatCard {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

interface StatsResponse {
  totalBookings: number;

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

      const data: StatsResponse = result.data;

      setStats([
        {
          title: 'Total Bookings',
          value: data.totalBookings,
          icon: <CalendarOutlined />,
          color: '#1677ff',
        },
        {
          title: 'Net Gross',
          value: data.revenue.netGross,
          icon: <RiseOutlined />,
          color: '#722ed1',
        },
        {
          title: 'Net Profit',
          value: data.revenue.netProfit,
          icon: <WalletOutlined />,
          color: '#16a34a',
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
      {(loading ? Array.from({ length: 3 }) : stats).map((item, index) => (
        <Col xs={24} sm={12} lg={8} key={loading ? index : (item as StatCard).title}>
          <Card
            style={{
              borderRadius: 16,
              border: 'none',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
            }}
            styles={{
              body: {
                padding: 18,
              },
            }}
          >
            {loading ? (
              <Skeleton active avatar={{ size: 'small' }} paragraph={{ rows: 1 }} />
            ) : (
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <Text type="secondary" className="text-xs font-medium">
                    {(item as StatCard).title}
                  </Text>

                  <Title
                    level={3}
                    style={{
                      marginTop: 6,
                      marginBottom: 0,
                      fontSize: 24,
                      lineHeight: 1.2,
                    }}
                  >
                    {typeof (item as StatCard).value === 'number'
                      ? (item as StatCard).value.toLocaleString()
                      : (item as StatCard).value}
                  </Title>
                </div>

                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg text-white shadow-sm"
                  style={{
                    backgroundColor: (item as StatCard).color,
                  }}
                >
                  {(item as StatCard).icon}
                </div>
              </div>
            )}
          </Card>
        </Col>
      ))}
    </Row>
  );
}
