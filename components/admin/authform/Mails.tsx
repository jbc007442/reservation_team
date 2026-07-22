'use client';

import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  MailOutlined,
} from '@ant-design/icons';
import { Button, Card, Flex, Space, Tag, Typography, List } from 'antd';

const { Text, Title } = Typography;

import { Booking } from '@/components/admin/booking/types';

interface MailHistoryProps {
  booking: Booking;
}

const mails = [
  {
    id: 1,
    subject: 'Card Authorization Form',
    recipient: 'bookmytrvl@gmail.com',
    sentAt: '12 Jul 2026 • 10:30 AM',
    status: 'Delivered',
    opened: true,
  },
  {
    id: 2,
    subject: 'Reminder Email',
    recipient: 'bookmytrvl@gmail.com',
    sentAt: '13 Jul 2026 • 09:15 AM',
    status: 'Pending',
    opened: false,
  },
];

export default function MailHistory({ booking }: MailHistoryProps) {
  return (
    <Card size="small" title="Mail History">
      <Flex vertical>
        {mails.map((mail, index) => (
          <div key={mail.id}>
            <Flex
              justify="space-between"
              align="center"
              style={{
                padding: '14px 18px',
                borderRadius: 8,
                cursor: 'pointer',
              }}
            >
              <Space size={16}>
                <MailOutlined
                  style={{
                    fontSize: 18,
                    color: '#1677ff',
                  }}
                />

                <div>
                  <Title
                    level={5}
                    style={{
                      margin: 0,
                      fontSize: 15,
                    }}
                  >
                    {mail.subject}
                  </Title>

                  <Text type="secondary">{mail.recipient}</Text>
                </div>
              </Space>

              <Space size={24}>
                <Text type="secondary">{mail.sentAt}</Text>

                <Tag color={mail.status === 'Delivered' ? 'success' : 'warning'}>{mail.status}</Tag>

                {mail.opened ? (
                  <CheckCircleOutlined
                    style={{
                      color: '#52c41a',
                      fontSize: 18,
                    }}
                  />
                ) : (
                  <ClockCircleOutlined
                    style={{
                      color: '#faad14',
                      fontSize: 18,
                    }}
                  />
                )}

                <Button type="text" icon={<EyeOutlined />} />
              </Space>
            </Flex>

            {index !== mails.length - 1 && <div style={{ borderTop: '1px solid #f0f0f0' }} />}
          </div>
        ))}
      </Flex>
    </Card>
  );
}
