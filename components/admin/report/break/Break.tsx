'use client';

import { useEffect, useState } from 'react';
import { Card, Col, DatePicker, Input, Row, Table, Tag } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

interface BreakRecord {
  key: string;

  employeeId: string;

  employeeName: string;

  email: string;

  session: 'AM' | 'PM';

  breakIn: string | null;

  breakOut: string | null;

  durationMinutes: number;

  status: 'Completed' | 'Active';
}

export default function Break() {
  const [data, setData] = useState<BreakRecord[]>([]);

  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState('');

  const [date, setDate] = useState(dayjs());

  /*
  |--------------------------------------------------------------------------
  | Fetch Break Report
  |--------------------------------------------------------------------------
  */

  const fetchBreakReport = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      if (search.trim()) {
        params.set('search', search.trim());
      }

      params.set('date', date.format('YYYY-MM-DD'));

      const response = await fetch(`/api/admin/attendance/break-report?${params.toString()}`, {
        cache: 'no-store',
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to fetch break report.');
      }

      setData(result.data || []);
    } catch (error) {
      console.error('Break report fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Search / Date
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBreakReport();
    }, 300);

    return () => clearTimeout(timer);
  }, [search, date]);

  /*
  |--------------------------------------------------------------------------
  | Format Time
  |--------------------------------------------------------------------------
  */

  const formatTime = (value: string | null) => {
    if (!value) {
      return '--';
    }

    return dayjs(value).format('hh:mm:ss A');
  };

  /*
  |--------------------------------------------------------------------------
  | Format Duration
  |--------------------------------------------------------------------------
  */

  const formatDuration = (minutes: number) => {
    if (!minutes) {
      return '00h 00m';
    }

    const hours = Math.floor(minutes / 60);

    const mins = minutes % 60;

    return `${String(hours).padStart(2, '0')}h ${String(mins).padStart(2, '0')}m`;
  };

  /*
  |--------------------------------------------------------------------------
  | Columns
  |--------------------------------------------------------------------------
  */

  const columns = [
    {
      title: 'Employee ID',
      dataIndex: 'employeeId',
      key: 'employeeId',
      width: 140,
    },

    {
      title: 'Employee',
      dataIndex: 'employeeName',
      key: 'employeeName',
      width: 200,

      render: (name: string) => <span className="font-medium text-slate-700">{name || '--'}</span>,
    },

    {
      title: 'Session',
      dataIndex: 'session',
      key: 'session',
      width: 100,
      align: 'center' as const,

      render: (session: BreakRecord['session']) => (
        <Tag color={session === 'AM' ? 'blue' : 'purple'}>{session}</Tag>
      ),
    },

    {
      title: 'Break In',
      dataIndex: 'breakIn',
      key: 'breakIn',
      width: 150,

      render: (value: string | null) => formatTime(value),
    },

    {
      title: 'Break Out',
      dataIndex: 'breakOut',
      key: 'breakOut',
      width: 150,

      render: (value: string | null) => formatTime(value),
    },

    {
      title: 'Duration',
      dataIndex: 'durationMinutes',
      key: 'durationMinutes',
      width: 140,
      align: 'center' as const,

      render: (minutes: number) => formatDuration(minutes),
    },

    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      align: 'center' as const,

      render: (status: BreakRecord['status']) => (
        <Tag color={status === 'Active' ? 'orange' : 'green'}>{status}</Tag>
      ),
    },
  ];

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}

      <div>
        <h1 className="text-3xl font-bold text-slate-900">Break Report</h1>

        <p className="mt-1 text-slate-500">View employee break history for AM and PM sessions.</p>
      </div>

      {/* Filters */}

      <Card className="rounded-xl">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={10} lg={8}>
            <Input
              size="large"
              allowClear
              prefix={<SearchOutlined className="text-slate-400" />}
              placeholder="Search employee or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Col>

          <Col xs={24} md={8} lg={5}>
            <DatePicker
              size="large"
              value={date}
              onChange={(value) => {
                if (value) {
                  setDate(value);
                }
              }}
              format="DD MMM YYYY"
              className="w-full"
            />
          </Col>
        </Row>
      </Card>

      {/* Report */}

      <Card
        title={<span className="text-lg font-semibold">Break History</span>}
        className="overflow-hidden rounded-xl"
      >
        <Table<BreakRecord>
          rowKey="key"
          columns={columns}
          dataSource={data}
          loading={loading}
          bordered
          size="middle"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['10', '25', '50', '100'],
          }}
          scroll={{
            x: 1000,
          }}
        />
      </Card>
    </div>
  );
}
