'use client';

import { useEffect, useState } from 'react';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  MailOutlined,
} from '@ant-design/icons';
import { Button, Card, Empty, Flex, Space, Tag, Modal, Typography } from 'antd';

import { Booking } from '@/components/admin/booking/types';

const { Text, Title } = Typography;

interface MailHistoryProps {
  booking: Booking;
}

interface MailItem {
  to: string;
  subject: string;
  html?: string;
  provider: string;
  messageId?: string;
  status: 'draft' | 'sent' | 'delivered' | 'opened' | 'failed';
  sentAt?: string;
  deliveredAt?: string;
  openedAt?: string;
}

export default function MailHistory({ booking }: MailHistoryProps) {
  const [mails, setMails] = useState<MailItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedMail, setSelectedMail] = useState<MailItem | null>(null);

  useEffect(() => {
    const loadMailHistory = async () => {
      try {
        const res = await fetch(`/api/authform/booking/${booking._id}`);
        const result = await res.json();

        if (result.success && result.data) {
          setMails(result.data.mailHistory || []);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (booking?._id) {
      loadMailHistory();
    }
  }, [booking._id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'processing';
      case 'delivered':
        return 'success';
      case 'opened':
        return 'purple';
      case 'failed':
        return 'error';
      default:
        return 'warning';
    }
  };

  return (
    <>
      <Card size="small" title="Mail History" loading={loading}>
        {mails.length === 0 ? (
          <Empty description="No emails sent yet" />
        ) : (
          <Flex vertical>
            {mails.map((mail, index) => (
              <div key={index}>
                <Flex
                  justify="space-between"
                  align="center"
                  style={{
                    padding: '14px 18px',
                    borderRadius: 8,
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

                      <Text type="secondary">{mail.to}</Text>
                    </div>
                  </Space>

                  <Space size={24}>
                    <Text type="secondary">
                      {mail.sentAt
                        ? new Date(mail.sentAt).toLocaleString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '-'}
                    </Text>

                    <Tag color={getStatusColor(mail.status)}>{mail.status.toUpperCase()}</Tag>

                    {mail.openedAt ? (
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

                    <Button
                      type="text"
                      icon={<EyeOutlined />}
                      onClick={() => {
                        setSelectedMail(mail);
                        setPreviewOpen(true);
                      }}
                    />
                  </Space>
                </Flex>

                {index !== mails.length - 1 && (
                  <div
                    style={{
                      borderTop: '1px solid #f0f0f0',
                    }}
                  />
                )}
              </div>
            ))}
          </Flex>
        )}
      </Card>

      <Modal
        title="Email Preview"
        open={previewOpen}
        footer={null}
        onCancel={() => {
          setPreviewOpen(false);
          setSelectedMail(null);
        }}
        width={900}
      >
        {selectedMail && (
          <Space direction="vertical" style={{ width: '100%' }} size={16}>
            <div>
              <strong>To:</strong> {selectedMail.to}
            </div>

            <div>
              <strong>Subject:</strong> {selectedMail.subject}
            </div>

            <div>
              <strong>Status:</strong>{' '}
              <Tag color={getStatusColor(selectedMail.status)}>
                {selectedMail.status.toUpperCase()}
              </Tag>
            </div>

            <div>
              <strong>Sent At:</strong>{' '}
              {selectedMail.sentAt ? new Date(selectedMail.sentAt).toLocaleString() : '-'}
            </div>

            <div
              style={{
                border: '1px solid #f0f0f0',
                borderRadius: 8,
                padding: 20,
                minHeight: 300,
                background: '#fff',
                overflow: 'auto',
              }}
              dangerouslySetInnerHTML={{
                __html: selectedMail.html || '<p>No content available.</p>',
              }}
            />
          </Space>
        )}
      </Modal>
    </>
  );
}
