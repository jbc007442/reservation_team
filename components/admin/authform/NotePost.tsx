'use client';

import { useState } from 'react';
import { Button, Drawer, Form, Input, Select, Switch, Upload, Space, Tooltip } from 'antd';
import { InboxOutlined, PlusOutlined, SaveOutlined } from '@ant-design/icons';
import { useAuthStore } from '@/store/authStore';

const { TextArea } = Input;
const { Dragger } = Upload;

interface NotePostProps {
  bookingId: string;
}

export default function NotePost({ bookingId }: NotePostProps) {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      setLoading(true);

      const response = await fetch('/api/authform/note', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId,
          addedBy: user?._id,
          ...values,
          attachments: [],
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message);
      }

      console.log(result);

      form.resetFields();
      setOpen(false);
    } catch (error: any) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => setOpen(true)}>
        Add Note
      </Button>

      <Drawer
        title="Add Internal Note"
        width={800}
        open={open}
        destroyOnClose
        onClose={() => setOpen(false)}
        extra={
          <Space>
            <Button onClick={() => setOpen(false)}>Cancel</Button>

            <Button type="primary" icon={<SaveOutlined />} loading={loading} onClick={handleSave}>
              Save Note
            </Button>
          </Space>
        }
      >
        <Form
          layout="vertical"
          form={form}
          initialValues={{
            type: 'note',
            visibility: 'internal',
            isPinned: false,
          }}
        >
          <Form.Item label="Title" name="title">
            <Input placeholder="Optional title" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item label="Type" name="type">
              <Select
                options={[
                  {
                    label: 'Note',
                    value: 'note',
                  },
                  {
                    label: 'Follow Up',
                    value: 'follow_up',
                  },
                  {
                    label: 'Warning',
                    value: 'warning',
                  },
                  {
                    label: 'System',
                    value: 'system',
                  },
                ]}
              />
            </Form.Item>

            <Form.Item label="Visibility" name="visibility">
              <Select
                options={[
                  {
                    label: 'Internal',
                    value: 'internal',
                  },
                  {
                    label: 'Customer',
                    value: 'customer',
                  },
                ]}
              />
            </Form.Item>
          </div>

          <Form.Item
            label="Note"
            name="note"
            rules={[
              {
                required: true,
                message: 'Please enter a note.',
              },
            ]}
          >
            <TextArea rows={8} placeholder="Write your note..." />
          </Form.Item>

          <Form.Item label="Attachment">
            <Dragger beforeUpload={() => false} maxCount={1}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>

              <p>Click or drag a file here</p>

              <p className="text-gray-500">Images, PDF, DOCX, XLSX...</p>
            </Dragger>
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item label="Pin this Note" name="isPinned" valuePropName="checked">
              <Switch />
            </Form.Item>

            <Form.Item label="Mark as Resolved" name="isResolved" valuePropName="checked">
              <Switch />
            </Form.Item>
          </div>
        </Form>
      </Drawer>
    </>
  );
}
