'use client';

import { useState } from 'react';
import { Col, Form, Input, Modal, Row, message, Space } from 'antd';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { useAuthStore } from '@/store/authStore';

interface SendEmailModalProps {
  open: boolean;
  onClose: () => void;
  bookingId: string;
  bookingNo: string;
  email: string;
  customerName: string;
}

export default function SendEmailModal({
  open,
  onClose,
  bookingId,
  bookingNo,
  email,
  customerName,
}: SendEmailModalProps) {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [content, setContent] = useState('');

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ color: [] }, { background: [] }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ align: [] }],
      ['link', 'image'],
      ['clean'],
    ],
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
      width={600}
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
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="From" name="from">
              <Input disabled />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="To"
              name="to"
              rules={[
                { required: true, message: 'Recipient email is required.' },
                { type: 'email', message: 'Enter a valid email.' },
              ]}
            >
              <Input placeholder="Recipient email" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="CC"
              name="cc"
              rules={[{ type: 'email', message: 'Enter a valid email.' }]}
            >
              <Input placeholder="Optional" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="BCC"
              name="bcc"
              rules={[{ type: 'email', message: 'Enter a valid email.' }]}
            >
              <Input placeholder="Optional" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="Subject" name="subject" rules={[{ required: true }]}>
          <Input placeholder="Enter email subject" />
        </Form.Item>

        <Form.Item label="Message">
          <ReactQuill
            theme="snow"
            value={content}
            onChange={setContent}
            modules={modules}
            style={{ height: 250, marginBottom: 60 }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
