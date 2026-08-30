'use client';

import { useEffect, useState } from 'react';
import { Card, Col, Row, Spin, message, Select, DatePicker } from 'antd';

import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  CoffeeOutlined,
} from '@ant-design/icons';

import dayjs, { Dayjs } from 'dayjs';

interface AttendanceSummary {
  presentDays: number;
  leaveDays: number;
  totalWorkingMinutes: number;
  totalBreakMinutes: number;
}

interface HistoryResponse {
  success: boolean;
  message?: string;

  employee?: {
    _id: string;
    name: string;
    employeeId?: string;
    email?: string;
  };

  summary?: AttendanceSummary;

  dateRange?: {
    startDate: string;
    endDate: string;
  };

  period?: 'day' | 'week' | 'month';
}

type Period = 'day' | 'week' | 'month';

const EMPTY_SUMMARY: AttendanceSummary = {
  presentDays: 0,
  leaveDays: 0,
  totalWorkingMinutes: 0,
  totalBreakMinutes: 0,
};

export default function History() {
  const [summary, setSummary] = useState<AttendanceSummary>(EMPTY_SUMMARY);

  const [loading, setLoading] = useState(true);

  const [period, setPeriod] = useState<Period>('month');

  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());

  /*
  |--------------------------------------------------------------------------
  | Format Minutes
  |--------------------------------------------------------------------------
  */

  const formatHours = (minutes: number) => {
    if (!minutes || minutes <= 0) {
      return '0h 00m';
    }

    const hours = Math.floor(minutes / 60);

    const mins = minutes % 60;

    return `${hours}h ${String(mins).padStart(2, '0')}m`;
  };

  /*
  |--------------------------------------------------------------------------
  | Fetch Summary
  |--------------------------------------------------------------------------
  */

  const fetchSummary = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      params.set('period', period);

      params.set('date', selectedDate.format('YYYY-MM-DD'));

      const response = await fetch(`/api/admin/attendance/users/history?${params.toString()}`, {
        method: 'GET',
        cache: 'no-store',
        credentials: 'include',
      });

      const result: HistoryResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to fetch attendance.');
      }

      setSummary(result.summary || EMPTY_SUMMARY);
    } catch (error) {
      console.error('Attendance summary error:', error);

      message.error(error instanceof Error ? error.message : 'Failed to fetch attendance summary.');

      setSummary(EMPTY_SUMMARY);
    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Fetch When Filter Changes
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    fetchSummary();
  }, [period, selectedDate]);

  /*
  |--------------------------------------------------------------------------
  | Date Picker
  |--------------------------------------------------------------------------
  */

  const renderDatePicker = () => {
    /*
    |--------------------------------------------------------------------------
    | Month
    |--------------------------------------------------------------------------
    */

    if (period === 'month') {
      return (
        <DatePicker
          picker="month"
          size="large"
          value={selectedDate}
          allowClear={false}
          onChange={(date) => {
            if (date) {
              setSelectedDate(date);
            }
          }}
        />
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Week
    |--------------------------------------------------------------------------
    */

    if (period === 'week') {
      return (
        <DatePicker
          picker="week"
          size="large"
          value={selectedDate}
          allowClear={false}
          onChange={(date) => {
            if (date) {
              setSelectedDate(date);
            }
          }}
        />
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Day
    |--------------------------------------------------------------------------
    */

    return (
      <DatePicker
        size="large"
        value={selectedDate}
        allowClear={false}
        onChange={(date) => {
          if (date) {
            setSelectedDate(date);
          }
        }}
      />
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Present Progress
  |--------------------------------------------------------------------------
  */

  const presentProgress = Math.min(summary.presentDays * 10, 100);

  /*
  |--------------------------------------------------------------------------
  | Leave Progress
  |--------------------------------------------------------------------------
  */

  const leaveProgress = Math.min(summary.leaveDays * 10, 100);

  /*
  |--------------------------------------------------------------------------
  | UI
  |--------------------------------------------------------------------------
  */

  return (
    <div className="space-y-6">
      {/* Header */}

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Attendance</h1>

          <p className="mt-1 text-slate-500">View your attendance summary and working hours.</p>
        </div>

        {/* Filters */}

        <div className="flex flex-wrap items-center gap-3">
          <Select
            size="large"
            value={period}
            style={{
              width: 150,
            }}
            onChange={(value: Period) => {
              setPeriod(value);
            }}
            options={[
              {
                value: 'day',
                label: 'Day',
              },
              {
                value: 'week',
                label: 'Week',
              },
              {
                value: 'month',
                label: 'Month',
              },
            ]}
          />

          {renderDatePicker()}
        </div>
      </div>

      {/* Summary Cards */}

      <Row gutter={[16, 16]}>
        {/* =========================================================
            PRESENT
        ========================================================= */}

        <Col xs={24} sm={12} md={6}>
          <Card
            className="overflow-hidden rounded-2xl border-0 shadow-sm"
            styles={{
              body: {
                padding: 20,
              },
            }}
          >
            <Spin spinning={loading}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="mb-2 text-sm font-medium text-slate-500">Present</p>

                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-bold text-slate-900">{summary.presentDays}</span>

                    <span className="mb-1 text-sm text-slate-400">days</span>
                  </div>

                  <p className="mt-2 text-xs text-slate-400">
                    {period === 'day'
                      ? 'Selected day'
                      : period === 'week'
                        ? 'Selected week'
                        : 'Selected month'}
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50">
                  <CheckCircleOutlined className="text-xl text-green-500" />
                </div>
              </div>

              <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-green-500 transition-all duration-500"
                  style={{
                    width: `${presentProgress}%`,
                  }}
                />
              </div>
            </Spin>
          </Card>
        </Col>

        {/* =========================================================
            BREAK TIME
        ========================================================= */}

        <Col xs={24} sm={12} md={6}>
          <Card
            className="overflow-hidden rounded-2xl border-0 shadow-sm"
            styles={{
              body: {
                padding: 20,
              },
            }}
          >
            <Spin spinning={loading}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="mb-2 text-sm font-medium text-slate-500">Break Time</p>

                  <div className="text-3xl font-bold text-slate-900">
                    {formatHours(summary.totalBreakMinutes)}
                  </div>

                  <p className="mt-2 text-xs text-slate-400">Total break duration</p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50">
                  <CoffeeOutlined className="text-xl text-orange-500" />
                </div>
              </div>

              {/* Mini Chart */}

              <div className="mt-5 flex h-10 items-end gap-1">
                {[20, 35, 25, 45, 30, 55, 40, 65, 50, 70, 45, 60].map((height, index) => (
                  <div
                    key={index}
                    className="flex-1 rounded-t bg-orange-200"
                    style={{
                      height: `${height}%`,
                      minHeight: '5px',
                    }}
                  />
                ))}
              </div>
            </Spin>
          </Card>
        </Col>

        {/* =========================================================
            APPROVED LEAVES
        ========================================================= */}

        <Col xs={24} sm={12} md={6}>
          <Card
            className="overflow-hidden rounded-2xl border-0 shadow-sm"
            styles={{
              body: {
                padding: 20,
              },
            }}
          >
            <Spin spinning={loading}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="mb-2 text-sm font-medium text-slate-500">Approved Leaves</p>

                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-bold text-slate-900">{summary.leaveDays}</span>

                    <span className="mb-1 text-sm text-slate-400">days</span>
                  </div>

                  <p className="mt-2 text-xs text-slate-400">Approved leave only</p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                  <CalendarOutlined className="text-xl text-blue-500" />
                </div>
              </div>

              <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all duration-500"
                  style={{
                    width: summary.leaveDays > 0 ? `${leaveProgress}%` : '0%',
                  }}
                />
              </div>
            </Spin>
          </Card>
        </Col>

        {/* =========================================================
            WORKING HOURS
        ========================================================= */}

        <Col xs={24} sm={12} md={6}>
          <Card
            className="overflow-hidden rounded-2xl border-0 shadow-sm"
            styles={{
              body: {
                padding: 20,
              },
            }}
          >
            <Spin spinning={loading}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="mb-2 text-sm font-medium text-slate-500">Working Hours</p>

                  <div className="text-3xl font-bold text-slate-900">
                    {formatHours(summary.totalWorkingMinutes)}
                  </div>

                  <p className="mt-2 text-xs text-slate-400">Total working time</p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50">
                  <ClockCircleOutlined className="text-xl text-purple-500" />
                </div>
              </div>

              {/* Mini Chart */}

              <div className="mt-5 flex h-10 items-end gap-1">
                {[35, 45, 30, 55, 65, 50, 75, 60, 80, 70, 85, 65].map((height, index) => (
                  <div
                    key={index}
                    className="flex-1 rounded-t bg-purple-300"
                    style={{
                      height: `${height}%`,
                      minHeight: '5px',
                    }}
                  />
                ))}
              </div>
            </Spin>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
