'use client';

import { useState } from 'react';
import { Card, Form, Input, DatePicker, Select, Button, Table, Tag, Row, Col, message } from 'antd';
import { SendOutlined } from '@ant-design/icons';

const { RangePicker } = DatePicker;
const { TextArea } = Input;

export default function LeavePage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const leaveHistory = [
    {
      key: '1',
      type: 'Casual Leave',
      from: '10 Jul 2026',
      to: '11 Jul 2026',
      days: 2,
      status: 'Approved',
    },
    {
      key: '2',
      type: 'Sick Leave',
      from: '25 Jun 2026',
      to: '25 Jun 2026',
      days: 1,
      status: 'Pending',
    },
    {
      key: '3',
      type: 'Privilege Leave',
      from: '15 Jun 2026',
      to: '17 Jun 2026',
      days: 3,
      status: 'Rejected',
    },
  ];

  const columns = [
    {
      title: 'Leave Type',
      dataIndex: 'type',
    },
    {
      title: 'From',
      dataIndex: 'from',
    },
    {
      title: 'To',
      dataIndex: 'to',
    },
    {
      title: 'Days',
      dataIndex: 'days',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (status: string) => {
        const color = status === 'Approved' ? 'green' : status === 'Pending' ? 'orange' : 'red';

        return <Tag color={color}>{status}</Tag>;
      },
    },
  ];

  const onFinish = (values: any) => {
    console.log(values);

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      message.success('Leave request submitted successfully.');
      form.resetFields();
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Apply Leave</h1>
        <p className="text-slate-500">Submit a leave request and track its approval status.</p>
      </div>

      <Row gutter={24}>
        <Col xs={24} lg={10}>
          <Card title="Leave Application">
            <Form layout="vertical" form={form} onFinish={onFinish}>
              <Form.Item
                label="Leave Type"
                name="leaveType"
                rules={[
                  {
                    required: true,
                    message: 'Please select leave type',
                  },
                ]}
              >
                <Select placeholder="Select Leave Type">
                  <Select.Option value="CL">Casual Leave</Select.Option>

                  <Select.Option value="SL">Sick Leave</Select.Option>

                  <Select.Option value="PL">Privilege Leave</Select.Option>

                  <Select.Option value="LOP">Leave Without Pay</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="Leave Duration"
                name="dates"
                rules={[
                  {
                    required: true,
                    message: 'Please select leave dates',
                  },
                ]}
              >
                <RangePicker className="w-full" />
              </Form.Item>

              <Form.Item
                label="Reason"
                name="reason"
                rules={[
                  {
                    required: true,
                    message: 'Please enter reason',
                  },
                ]}
              >
                <TextArea rows={4} placeholder="Reason for leave..." />
              </Form.Item>

              <Button
                htmlType="submit"
                type="primary"
                icon={<SendOutlined />}
                loading={loading}
                block
              >
                Submit Leave Request
              </Button>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={14}>
          <Card title="My Leave History">
            <Table columns={columns} dataSource={leaveHistory} pagination={false} />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
