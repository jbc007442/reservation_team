'use client';

import { useState } from 'react';
import { Col, Form, Input, Modal, Row, Select, message } from 'antd';

import {
  WelcomeTemplate,
  MarketingTemplate,
  NotificationTemplate,
} from '@/components/email/templates';

import { useAuthStore } from '@/store/authStore';

interface SendEmailModalProps {
  open: boolean;
  onClose: () => void;
  bookingId: string;
  bookingNo: string;
  email: string;
  customerName: string;
}

const templateOptions = [
  {
    label: 'Welcome',
    value: 'welcome',
  },
  {
    label: 'Marketing',
    value: 'marketing',
  },
  {
    label: 'Notification',
    value: 'notification',
  },
];

export default function SendEmailModal({
  open,
  onClose,
  bookingId,
  bookingNo,
  email,
  customerName,
}: SendEmailModalProps) {
  const { user } = useAuthStore();

  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);

  const [content, setContent] = useState('');

  const handleTemplateChange = (value: string) => {
    switch (value) {
      case 'welcome':
        setContent(
          WelcomeTemplate({
            customerName,
          })
        );
        break;

      case 'marketing':
        setContent(
          MarketingTemplate({
            title: '🔥 Limited Time Offer',
            description:
              'Book today and unlock exclusive discounts on flights, hotels and holiday packages.',
          })
        );
        break;

      case 'notification': {
        const html = NotificationTemplate({
          title: 'Booking Notification',
          message: `Your booking ${bookingNo} has been updated.`,
        });

        console.log(html);
        console.log(typeof html);

        setContent(html);
        break;
      }

      default:
        setContent('');
    }
  };

  const sendEmail = async () => {
    try {
      const values = await form.validateFields();

      setLoading(true);

      const res = await fetch('/api/authform/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId,

          performedBy: user?._id,

          to: values.to,

          cc: values.cc ? values.cc.split(',').map((v: string) => v.trim()) : [],

          bcc: values.bcc ? values.bcc.split(',').map((v: string) => v.trim()) : [],

          subject: values.subject,

          html: content,
        }),
      });

      const result = await res.json();

      if (!result.success) {
        throw new Error(result.message);
      }

      message.success(result.message);

      onClose();
    } catch (err: any) {
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Modal
      title="Compose Email"
      open={open}
      onCancel={onClose}
      onOk={sendEmail}
      okText="Send"
      width={560}
      confirmLoading={loading}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          from: 'crontex123@gmail.com',
          to: email,
          cc: '',
          bcc: '',
          subject: `Booking Confirmation - ${bookingNo}`,
        }}
      >
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item label="From" name="from">
              <Input disabled size="small" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="To"
              name="to"
              rules={[
                {
                  required: true,
                  message: 'Recipient email is required.',
                },
                {
                  type: 'email',
                  message: 'Enter a valid email.',
                },
              ]}
            >
              <Input size="small" placeholder="Recipient Email" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={12}>
          <Col span={12}>
            <Form.Item label="CC" name="cc">
              <Input size="small" placeholder="Optional" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="BCC" name="bcc">
              <Input size="small" placeholder="Optional" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="Subject"
          name="subject"
          rules={[
            {
              required: true,
              message: 'Subject is required.',
            },
          ]}
        >
          <Input size="small" />
        </Form.Item>

        <Form.Item label="Template">
          <Select
            size="small"
            placeholder="Select Email Template"
            options={templateOptions}
            onChange={handleTemplateChange}
            allowClear
          />
        </Form.Item>

        <Form.Item
          label="Preview"
          style={{
            marginBottom: 0,
          }}
        >
          <Form.Item
            style={{
              marginBottom: 0,
            }}
          >
            <div
              style={{
                height: 280,
                border: '1px solid #d9d9d9',
                borderRadius: 8,
                overflow: 'hidden',
                background: '#f5f5f5',
              }}
            >
              {content ? (
                <iframe
                  key={content}
                  title="Email Preview"
                  srcDoc={content}
                  sandbox="allow-same-origin"
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    display: 'block',
                    background: '#ffffff',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#999',
                    fontSize: 14,
                  }}
                >
                  Select an email template to preview.
                </div>
              )}
            </div>
          </Form.Item>
        </Form.Item>
      </Form>
    </Modal>
  );
}
