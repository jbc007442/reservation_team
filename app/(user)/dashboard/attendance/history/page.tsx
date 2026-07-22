'use client';

import { Card, Row, Col, Select, DatePicker, Table, Tag } from 'antd';

import { CheckCircleOutlined, ClockCircleOutlined, CalendarOutlined } from '@ant-design/icons';
import { Statistic } from 'antd';

const { Option } = Select;

const data = [
  {
    key: '1',
    date: '12 Jul 2026',
    shift: 'Morning',
    checkIn: '09:02 AM',
    checkOut: '06:08 PM',
    workingHours: '9h 06m',
    status: 'Present',
  },
  {
    key: '2',
    date: '11 Jul 2026',
    shift: 'Morning',
    checkIn: '09:18 AM',
    checkOut: '06:00 PM',
    workingHours: '8h 42m',
    status: 'Late',
  },
  {
    key: '3',
    date: '10 Jul 2026',
    shift: '-',
    checkIn: '-',
    checkOut: '-',
    workingHours: '-',
    status: 'Leave',
  },
];

const columns = [
  {
    title: 'Date',
    dataIndex: 'date',
  },
  {
    title: 'Shift',
    dataIndex: 'shift',
  },
  {
    title: 'Check In',
    dataIndex: 'checkIn',
  },
  {
    title: 'Check Out',
    dataIndex: 'checkOut',
  },
  {
    title: 'Working Hours',
    dataIndex: 'workingHours',
  },
  {
    title: 'Status',
    dataIndex: 'status',
    render: (status: string) => {
      const color =
        status === 'Present'
          ? 'green'
          : status === 'Late'
            ? 'orange'
            : status === 'Leave'
              ? 'blue'
              : 'red';

      return <Tag color={color}>{status}</Tag>;
    },
  },
];

export default function AttendanceHistoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Attendance</h1>
        <p className="text-slate-500">View your attendance history and working hours.</p>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={12} md={6}>
          <Card>
            <Statistic
              title="Present"
              value={22}
              prefix={<CheckCircleOutlined />}
              styles={{
                content: {
                  color: '#52c41a',
                },
              }}
            />
          </Card>
        </Col>

        <Col xs={12} md={6}>
          <Card>
            <Statistic
              title="Late"
              value={2}
              prefix={<ClockCircleOutlined />}
              styles={{
                content: {
                  color: '#faad14',
                },
              }}
            />
          </Card>
        </Col>

        <Col xs={12} md={6}>
          <Card>
            <Statistic
              title="Leaves"
              value={1}
              prefix={<CalendarOutlined />}
              styles={{
                content: {
                  color: '#1677ff',
                },
              }}
            />
          </Card>
        </Col>

        <Col xs={12} md={6}>
          <Card>
            <Statistic
              title="Working Hours"
              value="176h"
              styles={{
                content: {
                  color: '#722ed1',
                },
              }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <div className="mb-5 flex flex-wrap gap-4">
          <DatePicker picker="month" />

          <Select defaultValue="all" style={{ width: 160 }}>
            <Option value="all">All Status</Option>
            <Option value="present">Present</Option>
            <Option value="late">Late</Option>
            <Option value="leave">Leave</Option>
            <Option value="absent">Absent</Option>
          </Select>
        </div>

        <Table columns={columns} dataSource={data} pagination={{ pageSize: 10 }} />
      </Card>
    </div>
  );
}
