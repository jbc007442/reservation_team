'use client';

import { useState } from 'react';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  Popconfirm,
  Row,
  Select,
  Space,
  Table,
  Tag,
  message,
} from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';

export default function HolidayManagementPage() {
  const [form] = Form.useForm();

  const [holidays, setHolidays] = useState([
    {
      key: '1',
      date: '01 Jan 2026',
      name: "New Year's Day",
      type: 'Public Holiday',
    },
    {
      key: '2',
      date: '26 Jan 2026',
      name: 'Republic Day',
      type: 'National Holiday',
    },
    {
      key: '3',
      date: '15 Aug 2026',
      name: 'Independence Day',
      type: 'National Holiday',
    },
  ]);

  const onFinish = (values: any) => {
    const newHoliday = {
      key: Date.now().toString(),
      date: values.date.format('DD MMM YYYY'),
      name: values.name,
      type: values.type,
    };

    setHolidays([...holidays, newHoliday]);

    message.success('Holiday added successfully.');

    form.resetFields();
  };

  const handleDelete = (key: string) => {
    setHolidays(holidays.filter((item) => item.key !== key));

    message.success('Holiday deleted.');
  };

  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
    },
    {
      title: 'Holiday Name',
      dataIndex: 'name',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      render: (type: string) => {
        let color = 'blue';

        if (type === 'National Holiday') color = 'red';
        if (type === 'Festival') color = 'green';

        return <Tag color={color}>{type}</Tag>;
      },
    },
    {
      title: 'Action',
      render: (_: any, record: any) => (
        <Space>
          <Button icon={<EditOutlined />} type="default">
            Edit
          </Button>

          <Popconfirm title="Delete Holiday?" onConfirm={() => handleDelete(record.key)}>
            <Button danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Holiday Management</h1>

        <p className="text-slate-500">Create and manage company holidays.</p>
      </div>

      <Row gutter={24}>
        <Col xs={24} lg={8}>
          <Card title="Add Holiday">
            <Form layout="vertical" form={form} onFinish={onFinish}>
              <Form.Item
                label="Holiday Name"
                name="name"
                rules={[
                  {
                    required: true,
                    message: 'Enter holiday name',
                  },
                ]}
              >
                <Input placeholder="Holiday Name" />
              </Form.Item>

              <Form.Item
                label="Holiday Date"
                name="date"
                rules={[
                  {
                    required: true,
                    message: 'Select holiday date',
                  },
                ]}
              >
                <DatePicker className="w-full" />
              </Form.Item>

              <Form.Item
                label="Holiday Type"
                name="type"
                rules={[
                  {
                    required: true,
                    message: 'Select holiday type',
                  },
                ]}
              >
                <Select placeholder="Holiday Type">
                  <Select.Option value="National Holiday">National Holiday</Select.Option>

                  <Select.Option value="Public Holiday">Public Holiday</Select.Option>

                  <Select.Option value="Festival">Festival</Select.Option>
                </Select>
              </Form.Item>

              <Button htmlType="submit" type="primary" block icon={<PlusOutlined />}>
                Add Holiday
              </Button>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <Card title="Holiday List">
            <Table
              rowKey="key"
              columns={columns}
              dataSource={holidays}
              pagination={{
                pageSize: 10,
              }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
