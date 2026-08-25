'use client';

import { useEffect, useState } from 'react';
import { Card, DatePicker, Select, Space, Table, Tag, Typography, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs, { Dayjs } from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

interface Report {
  _id: string;
  employeeId?: string;
  employeeName?: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  halfDays: number;
  leaveDays: number;
  attendancePercentage: number;
}

export default function Reports() {
  const [data, setData] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>();
  const [dates, setDates] = useState<[Dayjs, Dayjs]>([
    dayjs().startOf('month'),
    dayjs().endOf('month'),
  ]);

  const fetchReport = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        from: dates[0].format('YYYY-MM-DD'),
        to: dates[1].format('YYYY-MM-DD'),
      });

      if (status) params.set('status', status);

      const res = await fetch(`/api/admin/attendance/report?${params}`);

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || 'Failed to load report');
      }

      setData(result.data || []);
    } catch (error: any) {
      message.error(error.message || 'Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const columns: ColumnsType<Report> = [
    {
      title: 'Employee ID',
      dataIndex: 'employeeId',
      width: 140,
      render: (value) => value || '-',
    },
    {
      title: 'Employee',
      dataIndex: 'employeeName',
      width: 220,
      render: (value) => <Text strong>{value || 'Unknown'}</Text>,
    },
    {
      title: 'Total Days',
      dataIndex: 'totalDays',
      align: 'center',
    },
    {
      title: 'Present',
      dataIndex: 'presentDays',
      align: 'center',
      render: (value) => <Tag color="green">{value}</Tag>,
    },
    {
      title: 'Absent',
      dataIndex: 'absentDays',
      align: 'center',
      render: (value) => <Tag color="red">{value}</Tag>,
    },
    {
      title: 'Half Day',
      dataIndex: 'halfDays',
      align: 'center',
      render: (value) => <Tag color="orange">{value}</Tag>,
    },
    {
      title: 'Leave',
      dataIndex: 'leaveDays',
      align: 'center',
      render: (value) => <Tag color="blue">{value}</Tag>,
    },
    {
      title: 'Attendance',
      dataIndex: 'attendancePercentage',
      align: 'center',
      render: (value) => (
        <Tag color={value < 75 ? 'red' : value < 90 ? 'orange' : 'green'}>
          {Number(value || 0).toFixed(2)}%
        </Tag>
      ),
    },
  ];

  return (
    <div>
      <Card
        bordered={false}
        className="overflow-hidden rounded-xl shadow-sm"
        styles={{ body: { padding: 0 } }}
      >
        {/* Header */}
        <div className="px-5 py-4">
          <Title level={3} style={{ margin: 0 }}>
            Attendance MIS Report
          </Title>
        </div>

        {/* Filters */}
        <div className="border-y border-gray-200 bg-gray-50 px-5 py-4">
          <div className="mb-3">
            <Text strong>Report Filters</Text>
          </div>

          <Space wrap size="middle">
            <RangePicker
              value={dates}
              format="DD MMM YYYY"
              onChange={(value) => {
                if (value) {
                  setDates(value as [Dayjs, Dayjs]);
                }
              }}
              className="h-9"
            />

            <Select
              allowClear
              placeholder="Attendance Status"
              value={status}
              onChange={setStatus}
              style={{ width: 180 }}
              options={[
                {
                  label: 'Present',
                  value: 'Present',
                },
                {
                  label: 'Absent',
                  value: 'Absent',
                },
                {
                  label: 'Half Day',
                  value: 'Half Day',
                },
                {
                  label: 'Leave',
                  value: 'Leave',
                },
                {
                  label: 'Holiday',
                  value: 'Holiday',
                },
                {
                  label: 'Weekly Off',
                  value: 'Weekly Off',
                },
              ]}
            />

            <button
              type="button"
              onClick={fetchReport}
              disabled={loading}
              className="h-9 rounded-md border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              {loading ? 'Loading...' : 'Apply Filter'}
            </button>

            <button
              type="button"
              onClick={() => {
                setStatus(undefined);
                setDates([dayjs().startOf('month'), dayjs().endOf('month')]);
              }}
              className="h-9 rounded-md border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              Reset
            </button>
          </Space>
        </div>

        {/* Table Header */}
        <div className="flex items-center justify-between px-5 py-4">
          <div>
            
          </div>

          <div className="text-sm text-gray-500">{data.length} Employees</div>
        </div>

        {/* Table */}
        <Table<Report>
          rowKey="_id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 1000 }}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} employees`,
          }}
        />
      </Card>
    </div>
  );
}
