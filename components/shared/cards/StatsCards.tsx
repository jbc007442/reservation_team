'use client';

import { Card, Col, Row, Skeleton, Typography } from 'antd';

const { Title, Text } = Typography;

export interface StatCard {
  title: string;
  value: string | number;
  change: string;
  icon: React.ReactNode;
  color: string;
}

interface StatsCardsProps {
  stats: StatCard[];
  loading?: boolean;
}

export default function StatsCards({ stats, loading = false }: StatsCardsProps) {
  return (
    <Row gutter={[24, 24]}>
      {(loading ? Array.from({ length: stats.length }) : stats).map((item, index) => (
        <Col xs={24} sm={12} lg={8} xl={8} key={loading ? index : (item as StatCard).title}>
          <Card
            hoverable={!loading}
            variant="borderless"
            className="rounded-3xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
          >
            {loading ? (
              <Skeleton active avatar paragraph={{ rows: 2 }} />
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <Text className="text-sm text-gray-500">{(item as StatCard).title}</Text>

                  <Title
                    level={2}
                    style={{
                      marginTop: 8,
                      marginBottom: 8,
                    }}
                  >
                    {(item as StatCard).value}
                  </Title>

                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-600">
                    {(item as StatCard).change} this month
                  </span>
                </div>

                <div
                  className="flex h-16 w-16 items-center justify-center rounded-2xl text-3xl text-white shadow-lg"
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
