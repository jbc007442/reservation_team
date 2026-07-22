'use client';

import { Card, Table, Tag, Calendar, Row, Col } from 'antd';

const holidays = [
  {
    key: '1',
    date: '01 Jan 2026',
    day: 'Thursday',
    holiday: "New Year's Day",
    type: 'Public Holiday',
  },
  {
    key: '2',
    date: '26 Jan 2026',
    day: 'Monday',
    holiday: 'Republic Day',
    type: 'National Holiday',
  },
  {
    key: '3',
    date: '15 Aug 2026',
    day: 'Saturday',
    holiday: 'Independence Day',
    type: 'National Holiday',
  },
  {
    key: '4',
    date: '02 Oct 2026',
    day: 'Friday',
    holiday: 'Gandhi Jayanti',
    type: 'National Holiday',
  },
  {
    key: '5',
    date: '25 Dec 2026',
    day: 'Friday',
    holiday: 'Christmas',
    type: 'Festival',
  },
];

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
    title: 'Holiday',
    dataIndex: 'holiday',
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
];

export default function HolidayPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Holiday Calendar</h1>
        <p className="text-slate-500">View company holidays and upcoming public holidays.</p>
      </div>

      <Row gutter={24}>
        <Col xs={24} lg={10}>
          <Card title="Calendar">
            <Calendar fullscreen={false} />
          </Card>
        </Col>

        <Col xs={24} lg={14}>
          <Card title="Holiday List">
            <Table columns={columns} dataSource={holidays} pagination={false} />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
