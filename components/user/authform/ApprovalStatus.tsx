'use client';

import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  SendOutlined,
} from '@ant-design/icons';
import { Button, Card, Col, Progress, Row, Space, Statistic, Steps, Tag } from 'antd';

import { Booking } from '@/components/user/booking/types';

interface BillingProps {
  booking: Booking;
}

export default function Billing({ booking }: BillingProps) {
  return (
    <Card title="Approval Status" size="small" className="shadow-sm">
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card size="small">
            <Statistic title="Current Status" value="Pending" valueStyle={{ color: '#faad14' }} />

            <Tag color="gold" className="mt-3">
              Waiting for Customer
            </Tag>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card size="small">
            <Statistic title="Approval Progress" value={50} suffix="%" />

            <Progress percent={50} status="active" className="mt-2" />
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card size="small">
            <Statistic title="Approval Method" value="Email" />

            <div className="mt-3 text-sm text-slate-500">Secure Authorization Link</div>
          </Card>
        </Col>
      </Row>

      <div className="mt-6">
        <Steps
          direction="vertical"
          current={1}
          items={[
            {
              title: 'Authorization Created',
              description: '12 Jul 2026 • 10:30 AM',
              icon: <CheckCircleOutlined />,
            },
            {
              title: 'Email Sent',
              description: 'Waiting for customer response',
              icon: <SendOutlined />,
            },
            {
              title: 'Customer Approval',
              description: 'Pending',
              icon: <ClockCircleOutlined />,
            },
            {
              title: 'Booking Confirmed',
              description: 'Not completed',
              icon: <CloseCircleOutlined />,
            },
          ]}
        />
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <Space>
          <Button>Resend Email</Button>

          <Button type="primary">Refresh Status</Button>
        </Space>
      </div>
    </Card>
  );
}
