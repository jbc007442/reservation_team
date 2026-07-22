'use client';

import { useEffect, useState } from 'react';
import dayjs from 'dayjs';

import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  SendOutlined,
} from '@ant-design/icons';

import {
  Button,
  Card,
  Col,
  Progress,
  Row,
  Space,
  Statistic,
  Steps,
  Tag,
  message,
} from 'antd';

import { Booking } from '@/components/admin/booking/types';

interface BillingProps {
  booking: Booking;
}

interface ApprovalData {
  createdAt: string;
  email: {
    lastSentAt?: string;
  };
  approval: {
    status:
      | 'draft'
      | 'sent'
      | 'opened'
      | 'submitted'
      | 'approved'
      | 'rejected'
      | 'expired';

    sentAt?: string;
    openedAt?: string;
    submittedAt?: string;
    approvedAt?: string;
    rejectedAt?: string;
  };
}

export default function Billing({ booking }: BillingProps) {
  const [data, setData] = useState<ApprovalData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchStatus = async () => {
    try {
      setLoading(true);

      const res = await fetch(`/api/authform/status/${booking._id}`);

      const result = await res.json();

      if (result.success) {
        setData(result.data);
      } else {
        message.error(result.message);
      }
    } catch (err) {
      console.error(err);
      message.error('Failed to load approval status.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [booking._id]);

  const approval = data?.approval;

  const status = approval?.status || 'draft';

  const progressMap: Record<ApprovalData['approval']['status'], number> = {
    draft: 10,
    sent: 30,
    opened: 60,
    submitted: 80,
    approved: 100,
    rejected: 100,
    expired: 100,
  };

  const currentStepMap: Record<ApprovalData['approval']['status'], number> = {
    draft: 0,
    sent: 1,
    opened: 1,
    submitted: 2,
    approved: 3,
    rejected: 3,
    expired: 3,
  };

  const progress = progressMap[status];
  const currentStep = currentStepMap[status];

  const sentAt = data?.email?.lastSentAt ?? approval?.sentAt;

  const tagColor =
    status === 'approved'
      ? 'green'
      : status === 'rejected'
      ? 'red'
      : status === 'expired'
      ? 'red'
      : 'gold';

  return (
    <Card title="Approval Status" size="small" className="shadow-sm">
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card size="small">
            <Statistic
              title="Current Status"
              value={status.toUpperCase()}
              valueStyle={{
                color:
                  status === 'approved'
                    ? '#52c41a'
                    : status === 'rejected'
                    ? '#ff4d4f'
                    : '#faad14',
              }}
            />

            <Tag color={tagColor} className="mt-3">
              {status === 'approved'
                ? 'Approved'
                : status === 'rejected'
                ? 'Rejected'
                : status === 'expired'
                ? 'Expired'
                : 'Waiting for Customer'}
            </Tag>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card size="small">
            <Statistic
              title="Approval Progress"
              value={progress}
              suffix="%"
            />

            <Progress
              percent={progress}
              status={
                status === 'approved'
                  ? 'success'
                  : status === 'rejected'
                  ? 'exception'
                  : 'active'
              }
              className="mt-2"
            />
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card size="small">
            <Statistic
              title="Approval Method"
              value="Email"
            />

            <div className="mt-3 text-sm text-slate-500">
              Secure Authorization Link
            </div>
          </Card>
        </Col>
      </Row>

      <div className="mt-6">
        <Steps
          orientation="vertical"
          current={currentStep}
          items={[
            {
              title: 'Authorization Created',
              description: data?.createdAt
                ? dayjs(data.createdAt).format('DD MMM YYYY • hh:mm A')
                : '-',
              icon: <CheckCircleOutlined />,
            },
            {
              title: 'Email Sent',
              description:
                data?.email?.lastSentAt ||
                approval?.sentAt
                  ? dayjs(
                      data?.email?.lastSentAt ??
                        approval?.sentAt
                    ).format('DD MMM YYYY • hh:mm A')
                  : 'Not Sent',
              icon: <SendOutlined />,
            },
            {
              title: 'Customer Approval',
              description: (() => {
                switch (status) {
                  case 'approved':
                    return approval?.approvedAt
                      ? dayjs(approval.approvedAt).format(
                          'DD MMM YYYY • hh:mm A'
                        )
                      : 'Approved';

                  case 'submitted':
                    return approval?.submittedAt
                      ? dayjs(approval.submittedAt).format(
                          'DD MMM YYYY • hh:mm A'
                        )
                      : 'Submitted';

                  case 'opened':
                    return approval?.openedAt
                      ? dayjs(approval.openedAt).format(
                          'DD MMM YYYY • hh:mm A'
                        )
                      : 'Opened';

                  case 'rejected':
                    return approval?.rejectedAt
                      ? dayjs(approval.rejectedAt).format(
                          'DD MMM YYYY • hh:mm A'
                        )
                      : 'Rejected';

                  default:
                    return 'Pending';
                }
              })(),
              icon: <ClockCircleOutlined />,
            },
            {
              title: 'Booking Confirmed',
              description: booking?.status === 'auth_completed'
                ? 'Completed'
                : 'Not Completed',
              icon: <CloseCircleOutlined />
            },
          ]}
        />
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <Space>
          <Button disabled={status === 'approved'}>
            Resend Email
          </Button>

          <Button
            type="primary"
            loading={loading}
            onClick={fetchStatus}
          >
            Refresh Status
          </Button>
        </Space>
      </div>
    </Card>
  );
}