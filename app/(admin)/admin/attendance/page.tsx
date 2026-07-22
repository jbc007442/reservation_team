'use client';

import { useState } from 'react';
import { Button, Card, Col, Input, Row, Select, Table, Tag } from 'antd';
import { EyeOutlined, DownloadOutlined } from '@ant-design/icons';

export default function DailyAttendancePage() {
  const [attendance] = useState([
    {
      key: '1',
      employee: 'Tarun Kumar',
      employeeId: 'EMP001',
      shift: 'Morning',
      checkIn: '09:03 AM',
      checkOut: '06:08 PM',
      hours: '09h 05m',
      status: 'Present',
      late: 'No',
    },
    {
      key: '2',
      employee: 'Rahul Sharma',
      employeeId: 'EMP002',
      shift: 'Morning',
      checkIn: '09:22 AM',
      checkOut: '--',
      hours: '06h 15m',
      status: 'Working',
      late: 'Yes',
    },
    {
      key: '3',
      employee: 'Amit Singh',
      employeeId: 'EMP003',
      shift: 'Morning',
      checkIn: '--',
      checkOut: '--',
      hours: '--',
      status: 'Absent',
      late: '--',
    },
    {
      key: '4',
      employee: 'Riya Patel',
      employeeId: 'EMP004',
      shift: 'Weekly Off',
      checkIn: '--',
      checkOut: '--',
      hours: '--',
      status: 'Weekly Off',
      late: '--',
    },
    {
      key: '5',
      employee: 'Priya Sharma',
      employeeId: 'EMP005',
      shift: 'Leave',
      checkIn: '--',
      checkOut: '--',
      hours: '--',
      status: 'Leave',
      late: '--',
    },
  ]);

  const columns = [
    {
      title: 'Employee ID',
      dataIndex: 'employeeId',
      width: 120,
    },
    {
      title: 'Employee',
      dataIndex: 'employee',
      width: 180,
    },
    {
      title: 'Shift',
      dataIndex: 'shift',
      width: 130,
    },
    {
      title: 'Check In',
      dataIndex: 'checkIn',
      width: 120,
    },
    {
      title: 'Check Out',
      dataIndex: 'checkOut',
      width: 120,
    },
    {
      title: 'Working Hours',
      dataIndex: 'hours',
      width: 140,
    },
    {
      title: 'Late',
      dataIndex: 'late',
      width: 90,
      align: 'center' as const,
      render: (late: string) => {
        if (late === '--') return '--';

        return <Tag color={late === 'Yes' ? 'red' : 'green'}>{late}</Tag>;
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 140,
      render: (status: string) => {
        let color = 'default';

        switch (status) {
          case 'Present':
            color = 'green';
            break;
          case 'Working':
            color = 'blue';
            break;
          case 'Absent':
            color = 'red';
            break;
          case 'Weekly Off':
            color = 'orange';
            break;
          case 'Leave':
            color = 'purple';
            break;
        }

        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: 'Action',
      width: 120,
      render: () => <Button icon={<EyeOutlined />}>View</Button>,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Daily Attendance</h1>

          <p className="text-slate-500">Monitor today's employee attendance.</p>
        </div>

        <Button type="primary" icon={<DownloadOutlined />}>
          Export
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Input.Search allowClear placeholder="Search employee..." />
          </Col>

          <Col xs={24} md={6}>
            <Select
              className="w-full"
              defaultValue="All"
              options={[
                { label: 'All Status', value: 'All' },
                { label: 'Present', value: 'Present' },
                { label: 'Working', value: 'Working' },
                { label: 'Absent', value: 'Absent' },
                { label: 'Leave', value: 'Leave' },
                { label: 'Weekly Off', value: 'Weekly Off' },
              ]}
            />
          </Col>

          <Col xs={24} md={6}>
            <Select
              className="w-full"
              defaultValue="All"
              options={[
                { label: 'All Shifts', value: 'All' },
                { label: 'Morning', value: 'Morning' },
                { label: 'Evening', value: 'Evening' },
                { label: 'Night', value: 'Night' },
              ]}
            />
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card title="Today's Attendance">
        <Table
          rowKey="key"
          columns={columns}
          dataSource={attendance}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1400 }}
        />
      </Card>
    </div>
  );
}
