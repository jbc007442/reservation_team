'use client';

import { useState } from 'react';
import { Button, Drawer, Empty, Form, Input, Select, Space, Typography, Upload } from 'antd';
import { InboxOutlined, PlusOutlined, SaveOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { TextArea } = Input;
const { Dragger } = Upload;

export default function NotePost() {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  const handleSave = () => {
    console.log(form.getFieldsValue());
    setOpen(false);
  };

  return (
    <>
      <div>
        <div className="mb-3 flex items-center justify-between">
          <Title level={5} style={{ margin: 0 }}>
            Internal Notes
          </Title>

          <Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => setOpen(true)}>
            Add Note
          </Button>
        </div>

        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No internal notes yet." />
      </div>

      <Drawer
        title="Add Internal Note"
        width={900}
        open={open}
        destroyOnClose
        onClose={() => setOpen(false)}
        extra={
          <Space>
            <Button onClick={() => setOpen(false)}>Cancel</Button>

            <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>
              Save Note
            </Button>
          </Space>
        }
      >
        <Form layout="vertical" form={form}>
          <Form.Item label="Title" name="title">
            <Input placeholder="Enter note title" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item label="Category" name="category" initialValue="General">
              <Select
                options={[
                  { label: 'General', value: 'General' },
                  { label: 'Customer', value: 'Customer' },
                  { label: 'Payment', value: 'Payment' },
                  { label: 'Flight', value: 'Flight' },
                  { label: 'Visa', value: 'Visa' },
                  { label: 'Follow Up', value: 'Follow Up' },
                ]}
              />
            </Form.Item>

            <Form.Item label="Priority" name="priority" initialValue="Normal">
              <Select
                options={[
                  { label: 'Low', value: 'Low' },
                  { label: 'Normal', value: 'Normal' },
                  { label: 'High', value: 'High' },
                  { label: 'Urgent', value: 'Urgent' },
                ]}
              />
            </Form.Item>
          </div>

          <Form.Item label="Note" name="note">
            <TextArea rows={10} placeholder="Write an internal note..." />
          </Form.Item>

          <Form.Item label="Attachments">
            <Dragger multiple beforeUpload={() => false}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>

              <p>Click or drag files here to attach</p>

              <p className="text-gray-500">PDF, Images, DOCX, XLSX, ZIP...</p>
            </Dragger>
          </Form.Item>
        </Form>
      </Drawer>
    </>
  );
}
