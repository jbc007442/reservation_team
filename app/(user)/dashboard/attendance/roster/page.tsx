'use client';

import { Card, Col, Row, Table, Tag, Typography } from 'antd';
import {
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CoffeeOutlined,
  HomeOutlined,
  CalendarTwoTone,
} from '@ant-design/icons';

const { Title, Text } = Typography;

const week = [
  { day: 'Mon', date: '13', status: 'Working', color: 'green' },
  { day: 'Tue', date: '14', status: 'Working', color: 'green' },
  { day: 'Wed', date: '15', status: 'Weekly Off', color: 'orange' },
  { day: 'Thu', date: '16', status: 'Holiday', color: 'red' },
  { day: 'Fri', date: '17', status: 'Leave', color: 'blue' },
  { day: 'Sat', date: '18', status: 'Working', color: 'green' },
  { day: 'Sun', date: '19', status: 'Working', color: 'green' },
];

const data = week.map((w, i) => ({
  key: i + 1,
  date: `${w.date} Jul 2026`,
  day: w.day,
  status: w.status,
  remark:
    w.status === 'Working'
      ? 'Attendance Allowed'
      : w.status === 'Weekly Off'
        ? 'Enjoy your day'
        : w.status === 'Holiday'
          ? 'Company Holiday'
          : 'Approved Leave',
}));

const columns = [
  {
    title: 'Date',
    dataIndex: 'date',
  },
  {
    title: 'Day',
    dataIndex: 'day',
  },
  {
    title: 'Status',
    dataIndex: 'status',
    render: (status: string) => {
      const color =
        status === 'Working'
          ? 'green'
          : status === 'Weekly Off'
            ? 'orange'
            : status === 'Holiday'
              ? 'red'
              : 'blue';

      return <Tag color={color}>{status}</Tag>;
    },
  },
  {
    title: 'Remark',
    dataIndex: 'remark',
  },
];

const stats = [
  {
    title: 'Working',
    value: 4,
    color: 'text-green-600',
    icon: <CheckCircleOutlined className="text-2xl text-green-600" />,
  },
  {
    title: 'Weekly Off',
    value: 1,
    color: 'text-orange-500',
    icon: <CoffeeOutlined className="text-2xl text-orange-500" />,
  },
  {
    title: 'Leave',
    value: 1,
    color: 'text-blue-600',
    icon: <CalendarTwoTone twoToneColor="#2563eb" className="text-2xl" />,
  },
  {
    title: 'Holiday',
    value: 1,
    color: 'text-red-500',
    icon: <HomeOutlined className="text-2xl text-red-500" />,
  },
];

export default function Page() {
  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <Title level={2} className="!mb-1">
          My Work Schedule
        </Title>
        <Text type="secondary">
          View your weekly roster, attendance availability, and upcoming work schedule.
        </Text>
      </div>

      {/* Weekly Calendar */}
      <Card
        title="This Week"
        extra={<CalendarOutlined className="text-lg" />}
        className="rounded-xl"
      >
        <div className="flex flex-wrap gap-5">
          {week.map((item) => (
            <div key={item.day} className="min-w-[140px] flex-1">
              <Card
                hoverable
                className="h-full rounded-xl transition-all duration-200 hover:-translate-y-1"
                styles={{ body: { padding: 20 } }}
              >
                <div className="text-center">
                  <Text type="secondary">{item.day}</Text>

                  <div className="my-3 text-3xl font-bold">{item.date}</div>

                  <Tag color={item.color}>{item.status}</Tag>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </Card>

      {/* Summary */}
      <Row gutter={[20, 20]}>
        {stats.map((item) => (
          <Col xs={12} md={6} key={item.title}>
            <Card className="h-full rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <Text type="secondary">{item.title}</Text>

                  <div className={`mt-2 text-4xl font-bold ${item.color}`}>{item.value}</div>
                </div>

                {item.icon}
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Upcoming Schedule */}
      <Card
        title="Upcoming Schedule"
        extra={<ClockCircleOutlined className="text-lg" />}
        className="rounded-xl"
      >
        <Table
          rowKey="key"
          columns={columns}
          dataSource={data}
          pagination={false}
          scroll={{ x: 700 }}
        />
      </Card>
    </div>
  );
}
