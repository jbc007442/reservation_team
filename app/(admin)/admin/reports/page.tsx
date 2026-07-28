'use client';

import { Button, Card, Input, Space, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { EyeOutlined, SearchOutlined } from '@ant-design/icons';

interface ReportData {
  key: string;
  bookingNo: string;
  customerName: string;
  service: string;
  travelDate: string;
  amount: number;
  status: 'Pending' | 'Approved' | 'Rejected';
}

const data: ReportData[] = [
  {
    key: '1',
    bookingNo: 'BK000001',
    customerName: 'Tarun Kumar',
    service: 'Flight',
    travelDate: '28 Jul 2026',
    amount: 450,
    status: 'Approved',
  },
  {
    key: '2',
    bookingNo: 'BK000002',
    customerName: 'Rahul Sharma',
    service: 'Hotel',
    travelDate: '30 Jul 2026',
    amount: 850,
    status: 'Pending',
  },
  {
    key: '3',
    bookingNo: 'BK000003',
    customerName: 'Amit Singh',
    service: 'Visa',
    travelDate: '02 Aug 2026',
    amount: 220,
    status: 'Rejected',
  },
];

const columns: ColumnsType<ReportData> = [
  {
    title: 'Booking No',
    dataIndex: 'bookingNo',
    key: 'bookingNo',
  },
  {
    title: 'Customer Name',
    dataIndex: 'customerName',
    key: 'customerName',
  },
  {
    title: 'Service',
    dataIndex: 'service',
    key: 'service',
  },
  {
    title: 'Travel Date',
    dataIndex: 'travelDate',
    key: 'travelDate',
  },
  {
    title: 'Amount',
    dataIndex: 'amount',
    key: 'amount',
    render: (amount: number) => `$${amount}`,
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: (status: string) => {
      const color = status === 'Approved' ? 'green' : status === 'Pending' ? 'orange' : 'red';

      return <Tag color={color}>{status}</Tag>;
    },
  },
  {
    title: 'Action',
    key: 'action',
    align: 'center',
    render: () => (
      <Space>
        <Button type="primary" icon={<EyeOutlined />} size="small">
          View
        </Button>
      </Space>
    ),
  },
];

export default function ReportsPage() {
  return (
    <Card title="Reports">
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="Search..."
          prefix={<SearchOutlined />}
          allowClear
          style={{ width: 300 }}
        />
      </Space>

      <Table
        rowKey="key"
        columns={columns}
        dataSource={data}
        bordered
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
        }}
      />
    </Card>
  );
}
