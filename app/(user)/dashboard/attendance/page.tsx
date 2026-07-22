'use client';

import { Alert, Button, Card, Col, Divider, Row, Space, Statistic, Tag, Timeline } from 'antd';
import {
  ClockCircleOutlined,
  LoginOutlined,
  LogoutOutlined,
  CoffeeOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
} from '@ant-design/icons';

export default function AttendancePage() {
  // Dummy data (replace with API later)
  const attendance = {
    date: '12 Jul 2026',
    shift: 'Morning Shift',
    startTime: '09:00 AM',
    endTime: '06:00 PM',
    checkIn: null, // '09:03 AM'
    checkOut: null, // '06:08 PM'
    workingHours: '00:00',
    status: 'Not Checked In',
    location: 'MWC Digital Solutions',
    isHoliday: false,
    isWeeklyOff: false,
  };

  if (attendance.isHoliday) {
    return (
      <Alert
        type="success"
        showIcon
        message="Today is a Holiday"
        description="Attendance is not required today."
      />
    );
  }

  if (attendance.isWeeklyOff) {
    return <Alert type="info" showIcon message="Weekly Off" description="Enjoy your day off." />;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Mark Attendance</h1>
        <p className="text-slate-500">Check in, check out and track today's working hours.</p>
      </div>

      {/* Shift Card */}
      <Card variant="borderless">
        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <Space orientation="vertical" size={4}>
              <Tag color="blue" icon={<CalendarOutlined />}>
                Today's Shift
              </Tag>

              <h2 className="text-2xl font-bold">{attendance.shift}</h2>

              <p className="text-slate-500">
                {attendance.startTime} - {attendance.endTime}
              </p>

              <Tag color="green">{attendance.status}</Tag>
            </Space>
          </Col>

          <Col xs={24} md={12}>
            <Space orientation="vertical">
              <span className="text-slate-500">Today's Date</span>
              <strong>{attendance.date}</strong>

              <span className="text-slate-500 mt-3">
                <EnvironmentOutlined /> {attendance.location}
              </span>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Statistics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card>
            <Statistic
              title="Check In"
              value={attendance.checkIn ?? '--'}
              prefix={<LoginOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card>
            <Statistic
              title="Check Out"
              value={attendance.checkOut ?? '--'}
              prefix={<LogoutOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card>
            <Statistic
              title="Working Hours"
              value={attendance.workingHours}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Attendance Actions */}
      <Card title="Today's Attendance">
        {!attendance.checkIn ? (
          <Button type="primary" size="large" icon={<LoginOutlined />}>
            Check In
          </Button>
        ) : !attendance.checkOut ? (
          <Space>
            <Button icon={<CoffeeOutlined />} size="large">
              Start Break
            </Button>

            <Button danger size="large" icon={<LogoutOutlined />}>
              Check Out
            </Button>
          </Space>
        ) : (
          <Tag color="success">Attendance Completed</Tag>
        )}
      </Card>

      {/* Break History */}
      <Card title="Today's Breaks">
        <Timeline
          items={[
            {
              color: 'gray',
              content: 'No breaks recorded.',
            },
          ]}
        />
      </Card>

      {/* Information */}
      <Card title="Attendance Rules">
        <ul className="list-disc pl-5 space-y-2 text-slate-600">
          <li>Shift Time: 09:00 AM - 06:00 PM</li>
          <li>Grace Time: 15 Minutes</li>
          <li>Maximum Break: 60 Minutes</li>
          <li>Late check-in after 09:15 AM.</li>
          <li>Location must be within office premises.</li>
        </ul>

        <Divider />

        <Alert
          type="warning"
          showIcon
          title="Note"
          description="This page currently uses dummy data. It will be connected to the Attendance, Roster and Shift APIs later."
        />
      </Card>
    </div>
  );
}
