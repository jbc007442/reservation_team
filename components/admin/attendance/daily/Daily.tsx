'use client';

import { useEffect, useState } from 'react';
import { Avatar, Card, Col, DatePicker, Input, Row, Segmented, Table, Button, Tooltip } from 'antd';

import {
  SearchOutlined,
  LeftOutlined,
  RightOutlined,
  CalendarOutlined,
  FileExcelOutlined,
} from '@ant-design/icons';

import * as XLSX from 'xlsx';

import dayjs, { Dayjs } from 'dayjs';

/*
|--------------------------------------------------------------------------
| User
|--------------------------------------------------------------------------
*/

interface User {
  _id: string;
  employeeId?: string;
  name: string;
  email?: string;
  avatar?: string;
  department?: string;
  designation?: string;
}

/*
|--------------------------------------------------------------------------
| Attendance Session
|--------------------------------------------------------------------------
*/

interface AttendanceSession {
  checkIn: string | null;
  checkOut: string | null;
  workingMinutes: number;
  breakMinutes: number;
  currentStatus: string;
  lastActivityAt?: string | null;
  autoLogoutAt?: string | null;
}

/*
|--------------------------------------------------------------------------
| Common Attendance Status
|--------------------------------------------------------------------------
|
| status is the SINGLE common status.
|
| P   = Present
| WO  = Weekly Off
| L   = Leave
| H   = Holiday
| HD  = Half Day
| OD  = On Duty
| WFH = Work From Home
| SL  = Short Login
|
| A / Absent is intentionally NOT displayed in UI.
|
|--------------------------------------------------------------------------
*/

interface AttendanceDay {
  /*
  |--------------------------------------------------------------------------
  | Single Common Status
  |--------------------------------------------------------------------------
  */

  status?: string | null;

  /*
  |--------------------------------------------------------------------------
  | Current Login Status
  |--------------------------------------------------------------------------
  */

  currentStatus: string;

  /*
  |--------------------------------------------------------------------------
  | Time
  |--------------------------------------------------------------------------
  */

  workingMinutes: number;
  breakMinutes: number;

  /*
  |--------------------------------------------------------------------------
  | Sessions
  |--------------------------------------------------------------------------
  */

  am: AttendanceSession | null;
  pm: AttendanceSession | null;
}

/*
|--------------------------------------------------------------------------
| Roster User
|--------------------------------------------------------------------------
*/

interface RosterUser {
  employee: User;
  attendance: Record<string, AttendanceDay>;
}

/*
|--------------------------------------------------------------------------
| View Mode
|--------------------------------------------------------------------------
*/

type ViewMode = 'Daily' | 'Weekly' | 'Monthly';

/*
|--------------------------------------------------------------------------
| Component
|--------------------------------------------------------------------------
*/

export default function Daily() {
  const [roster, setRoster] = useState<RosterUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('Weekly');
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());

  /*
  |--------------------------------------------------------------------------
  | Get Roster Date Range
  |--------------------------------------------------------------------------
  */

  const getRosterRange = () => {
    if (viewMode === 'Daily') {
      return {
        from: selectedDate.format('YYYY-MM-DD'),
        to: selectedDate.format('YYYY-MM-DD'),
      };
    }

    if (viewMode === 'Weekly') {
      const start = selectedDate.startOf('week').add(1, 'day');
      const end = start.add(6, 'day');

      return {
        from: start.format('YYYY-MM-DD'),
        to: end.format('YYYY-MM-DD'),
      };
    }

    return {
      from: selectedDate.startOf('month').format('YYYY-MM-DD'),
      to: selectedDate.endOf('month').format('YYYY-MM-DD'),
    };
  };

  /*
  |--------------------------------------------------------------------------
  | Fetch Roster
  |--------------------------------------------------------------------------
  */

  const fetchRoster = async () => {
    try {
      setLoading(true);

      const { from, to } = getRosterRange();

      const params = new URLSearchParams();

      params.set('from', from);
      params.set('to', to);

      if (search.trim()) {
        params.set('search', search.trim());
      }

      const response = await fetch(`/api/admin/attendance/roasters?${params.toString()}`, {
        cache: 'no-store',
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to fetch roster.');
      }

      setRoster(result.data || []);
    } catch (error) {
      console.error('Fetch Roster Error:', error);
      setRoster([]);
    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Load Data
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    fetchRoster();

    /*
    |--------------------------------------------------------------------------
    | Refresh Every Minute
    |--------------------------------------------------------------------------
    |
    | This allows live status to update:
    |
    | SL -> HD -> P
    |
    */

    const interval = setInterval(() => {
      fetchRoster();
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, [search, viewMode, selectedDate]);

  /*
  |--------------------------------------------------------------------------
  | Date Navigation
  |--------------------------------------------------------------------------
  */

  const previousPeriod = () => {
    if (viewMode === 'Daily') {
      setSelectedDate(selectedDate.subtract(1, 'day'));
      return;
    }

    if (viewMode === 'Weekly') {
      setSelectedDate(selectedDate.subtract(1, 'week'));
      return;
    }

    setSelectedDate(selectedDate.subtract(1, 'month'));
  };

  const nextPeriod = () => {
    if (viewMode === 'Daily') {
      setSelectedDate(selectedDate.add(1, 'day'));
      return;
    }

    if (viewMode === 'Weekly') {
      setSelectedDate(selectedDate.add(1, 'week'));
      return;
    }

    setSelectedDate(selectedDate.add(1, 'month'));
  };

  const goToday = () => {
    setSelectedDate(dayjs());
  };

  /*
  |--------------------------------------------------------------------------
  | Date Label
  |--------------------------------------------------------------------------
  */

  const getDateLabel = () => {
    if (viewMode === 'Daily') {
      return selectedDate.format('DD MMM YYYY');
    }

    if (viewMode === 'Weekly') {
      const start = selectedDate.startOf('week').add(1, 'day');
      const end = start.add(6, 'day');

      return `${start.format('DD MMM')} - ${end.format('DD MMM YYYY')}`;
    }

    return selectedDate.format('MMMM YYYY');
  };

  /*
  |--------------------------------------------------------------------------
  | Weekly Dates
  |--------------------------------------------------------------------------
  */

  const getWeekDates = () => {
    const start = selectedDate.startOf('week').add(1, 'day');

    return Array.from({ length: 7 }, (_, index) => start.add(index, 'day'));
  };

  /*
  |--------------------------------------------------------------------------
  | Monthly Dates
  |--------------------------------------------------------------------------
  */

  const getMonthDates = () => {
    const start = selectedDate.startOf('month');
    const days = selectedDate.daysInMonth();

    return Array.from({ length: days }, (_, index) => start.add(index, 'day'));
  };

  /*
  |--------------------------------------------------------------------------
  | Get Attendance
  |--------------------------------------------------------------------------
  */

  const getAttendance = (record: RosterUser, date: Dayjs): AttendanceDay | null => {
    return record.attendance?.[date.format('YYYY-MM-DD')] || null;
  };

  /*
  |--------------------------------------------------------------------------
  | Format Working Time
  |--------------------------------------------------------------------------
  */

  const formatWorkingTime = (minutes: number) => {
    const safeMinutes = Math.max(0, Number(minutes || 0));

    const hours = Math.floor(safeMinutes / 60);

    const remainingMinutes = safeMinutes % 60;

    return `${hours}h ${remainingMinutes}m`;
  };

  /*
  |--------------------------------------------------------------------------
  | Common Status Configuration
  |--------------------------------------------------------------------------
  |
  | A / Absent intentionally removed.
  |
  */

  const getStatusConfig = (status?: string | null) => {
    if (!status) {
      return null;
    }

    switch (status) {
      /*
      |--------------------------------------------------------------------------
      | Present
      |--------------------------------------------------------------------------
      */

      case 'Present':
      case 'P':
        return {
          label: 'P',
          description: 'Present',
          className: 'bg-green-100 text-green-700 border-green-200',
        };

      /*
      |--------------------------------------------------------------------------
      | Half Day
      |--------------------------------------------------------------------------
      */

      case 'Half Day':
      case 'HD':
        return {
          label: 'HD',
          description: 'Half Day',
          className: 'bg-orange-100 text-orange-700 border-orange-200',
        };

      /*
      |--------------------------------------------------------------------------
      | Short Login
      |--------------------------------------------------------------------------
      */

      case 'Short Login':
      case 'SL':
        return {
          label: 'SL',
          description: 'Short Login',
          className: 'bg-blue-100 text-blue-700 border-blue-200',
        };

      /*
      |--------------------------------------------------------------------------
      | Leave
      |--------------------------------------------------------------------------
      */

      case 'Leave':
      case 'L':
        return {
          label: 'L',
          description: 'Leave',
          className: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        };

      /*
      |--------------------------------------------------------------------------
      | Weekly Off
      |--------------------------------------------------------------------------
      */

      case 'Weekly Off':
      case 'Week Off':
      case 'WO':
        return {
          label: 'WO',
          description: 'Week Off',
          className: 'bg-slate-100 text-slate-500 border-slate-200',
        };

      /*
      |--------------------------------------------------------------------------
      | Holiday
      |--------------------------------------------------------------------------
      */

      case 'Holiday':
      case 'H':
        return {
          label: 'H',
          description: 'Holiday',
          className: 'bg-purple-100 text-purple-700 border-purple-200',
        };

      /*
      |--------------------------------------------------------------------------
      | On Duty
      |--------------------------------------------------------------------------
      */

      case 'On Duty':
      case 'OD':
        return {
          label: 'OD',
          description: 'On Duty',
          className: 'bg-cyan-100 text-cyan-700 border-cyan-200',
        };

      /*
      |--------------------------------------------------------------------------
      | Work From Home
      |--------------------------------------------------------------------------
      */

      case 'Work From Home':
      case 'WFH':
        return {
          label: 'WFH',
          description: 'Work From Home',
          className: 'bg-indigo-100 text-indigo-700 border-indigo-200',
        };

      /*
      |--------------------------------------------------------------------------
      | Unknown / Absent
      |--------------------------------------------------------------------------
      |
      | Do not display unknown values such as A.
      |
      */

      default:
        return null;
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Status UI
  |--------------------------------------------------------------------------
  |
  | Only ONE common status is displayed.
  |
  */

  const renderStatus = (date: Dayjs, record: RosterUser) => {
    const attendance = getAttendance(record, date);

    /*
    |--------------------------------------------------------------------------
    | No Attendance Record
    |--------------------------------------------------------------------------
    */

    if (!attendance) {
      return (
        <div className="flex justify-center">
          <span
            className="
              flex h-8 min-w-8
              items-center justify-center
              rounded-lg
              bg-slate-100
              px-2
              text-xs
              font-semibold
              text-slate-400
            "
          >
            -
          </span>
        </div>
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Common Status
    |--------------------------------------------------------------------------
    */

    const statusConfig = getStatusConfig(attendance.status);

    /*
    |--------------------------------------------------------------------------
    | No Displayable Status
    |--------------------------------------------------------------------------
    |
    | This includes A / Absent.
    |
    */

    if (!statusConfig) {
      return (
        <div className="flex justify-center">
          <span
            className="
              flex h-8 min-w-8
              items-center justify-center
              rounded-lg
              bg-slate-100
              px-2
              text-xs
              font-semibold
              text-slate-400
            "
          >
            -
          </span>
        </div>
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Single Status Badge
    |--------------------------------------------------------------------------
    */

    return (
      <div className="flex justify-center">
        <Tooltip
          title={`${statusConfig.description} • ${formatWorkingTime(attendance.workingMinutes)}`}
        >
          <span
            className={`
              flex h-8 min-w-8
              cursor-default
              items-center justify-center
              rounded-lg
              border
              px-1.5
              text-xs
              font-bold
              ${statusConfig.className}
            `}
          >
            {statusConfig.label}
          </span>
        </Tooltip>
      </div>
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Employee Column
  |--------------------------------------------------------------------------
  */

  const employeeColumn = {
    title: 'Employee',
    key: 'employee',
    fixed: 'left' as const,
    width: 260,

    render: (_: unknown, record: RosterUser) => (
      <div className="flex items-center gap-3">
        <Avatar size={42} src={record.employee.avatar} className="bg-slate-900 text-white">
          {record.employee.name
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map((word) => word.charAt(0))
            .join('')
            .toUpperCase()}
        </Avatar>

        <div className="min-w-0">
          <div className="truncate font-semibold text-slate-800">{record.employee.name}</div>

          <div className="mt-0.5 text-xs text-slate-400">
            {record.employee.employeeId || record.employee.designation || ''}
          </div>
        </div>
      </div>
    ),
  };

  /*
  |--------------------------------------------------------------------------
  | Daily Columns
  |--------------------------------------------------------------------------
  */

  const getDailyColumns = () => [
    employeeColumn,

    {
      title: (
        <div className="text-center">
          <div className="text-xs text-slate-400">{selectedDate.format('dddd')}</div>

          <div className="mt-1 font-semibold text-slate-700">{selectedDate.format('DD MMM')}</div>
        </div>
      ),

      key: selectedDate.format('YYYY-MM-DD'),

      align: 'center' as const,

      width: 160,

      render: (_: unknown, record: RosterUser) => renderStatus(selectedDate, record),
    },

    {
      title: 'Details',

      key: 'details',

      align: 'center' as const,

      width: 250,

      render: (_: unknown, record: RosterUser) => {
        const attendance = getAttendance(record, selectedDate);

        if (!attendance) {
          return <span className="text-xs text-slate-400">Not Marked</span>;
        }

        const statusConfig = getStatusConfig(attendance.status);

        return (
          <div className="text-xs text-slate-500">
            <div className="flex flex-wrap items-center justify-center gap-2">
              {statusConfig ? (
                <span
                  className={`
                    rounded-full
                    border
                    px-2
                    py-0.5
                    text-[10px]
                    font-bold
                    ${statusConfig.className}
                  `}
                >
                  {statusConfig.label}
                  {' · '}
                  {statusConfig.description}
                </span>
              ) : (
                <span>Not Marked</span>
              )}
            </div>

            <div className="mt-1">Working: {formatWorkingTime(attendance.workingMinutes)}</div>

            {attendance.breakMinutes > 0 && (
              <div className="mt-0.5 text-[11px] text-slate-400">
                Break: {formatWorkingTime(attendance.breakMinutes)}
              </div>
            )}

            <div className="mt-0.5 text-[11px] text-slate-400">
              Status: {attendance.currentStatus || 'Checked Out'}
            </div>
          </div>
        );
      },
    },
  ];

  /*
  |--------------------------------------------------------------------------
  | Weekly Columns
  |--------------------------------------------------------------------------
  */

  const getWeeklyColumns = () => [
    employeeColumn,

    ...getWeekDates().map((date) => ({
      title: (
        <div className="text-center">
          <div className="text-xs font-medium text-slate-400">{date.format('ddd')}</div>

          <div
            className={`
              mt-1
              text-sm
              font-semibold
              ${date.isSame(dayjs(), 'day') ? 'text-blue-600' : 'text-slate-700'}
            `}
          >
            {date.format('DD')}
          </div>
        </div>
      ),

      key: date.format('YYYY-MM-DD'),

      width: 100,

      align: 'center' as const,

      render: (_: unknown, record: RosterUser) => renderStatus(date, record),
    })),
  ];

  /*
  |--------------------------------------------------------------------------
  | Monthly Columns
  |--------------------------------------------------------------------------
  */

  const getMonthlyColumns = () => [
    employeeColumn,

    ...getMonthDates().map((date) => ({
      title: (
        <div className="text-center">
          <div className="text-[10px] font-medium text-slate-400">{date.format('ddd')}</div>

          <div
            className={`
              mt-1
              text-xs
              font-semibold
              ${date.isSame(dayjs(), 'day') ? 'text-blue-600' : 'text-slate-700'}
            `}
          >
            {date.format('DD')}
          </div>
        </div>
      ),

      key: date.format('YYYY-MM-DD'),

      width: 72,

      align: 'center' as const,

      render: (_: unknown, record: RosterUser) => renderStatus(date, record),
    })),
  ];

  /*
  |--------------------------------------------------------------------------
  | Columns
  |--------------------------------------------------------------------------
  */

  const columns =
    viewMode === 'Daily'
      ? getDailyColumns()
      : viewMode === 'Weekly'
        ? getWeeklyColumns()
        : getMonthlyColumns();

  /*
  |--------------------------------------------------------------------------
  | Export Excel
  |--------------------------------------------------------------------------
  */

  const exportToExcel = () => {
    const rows: Record<string, string | number>[] = [];

    /*
    |--------------------------------------------------------------------------
    | Daily Export
    |--------------------------------------------------------------------------
    */

    if (viewMode === 'Daily') {
      const dateKey = selectedDate.format('YYYY-MM-DD');

      roster.forEach((record) => {
        const attendance = record.attendance?.[dateKey];

        const statusConfig = getStatusConfig(attendance?.status);

        rows.push({
          Employee: record.employee.name,

          'Employee ID': record.employee.employeeId || '',

          Date: selectedDate.format('DD MMM YYYY'),

          Status: statusConfig?.label || 'Not Marked',

          'Working Time': attendance ? formatWorkingTime(attendance.workingMinutes) : '0h 0m',

          'Break Time': attendance ? formatWorkingTime(attendance.breakMinutes) : '0h 0m',

          'Current Status': attendance?.currentStatus || 'Checked Out',
        });
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Weekly Export
    |--------------------------------------------------------------------------
    */

    if (viewMode === 'Weekly') {
      const weekDates = getWeekDates();

      roster.forEach((record) => {
        const row: Record<string, string | number> = {
          Employee: record.employee.name,

          'Employee ID': record.employee.employeeId || '',
        };

        weekDates.forEach((date) => {
          const dateKey = date.format('YYYY-MM-DD');

          const attendance = record.attendance?.[dateKey];

          const statusConfig = getStatusConfig(attendance?.status);

          row[date.format('DD MMM')] = statusConfig?.label || 'Not Marked';
        });

        rows.push(row);
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Monthly Export
    |--------------------------------------------------------------------------
    */

    if (viewMode === 'Monthly') {
      const monthDates = getMonthDates();

      roster.forEach((record) => {
        const row: Record<string, string | number> = {
          Employee: record.employee.name,

          'Employee ID': record.employee.employeeId || '',
        };

        monthDates.forEach((date) => {
          const dateKey = date.format('YYYY-MM-DD');

          const attendance = record.attendance?.[dateKey];

          const statusConfig = getStatusConfig(attendance?.status);

          row[date.format('DD MMM')] = statusConfig?.label || 'Not Marked';
        });

        rows.push(row);
      });
    }

    /*
    |--------------------------------------------------------------------------
    | No Data
    |--------------------------------------------------------------------------
    */

    if (!rows.length) {
      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Create Worksheet
    |--------------------------------------------------------------------------
    */

    const worksheet = XLSX.utils.json_to_sheet(rows);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance Roster');

    /*
    |--------------------------------------------------------------------------
    | Column Widths
    |--------------------------------------------------------------------------
    */

    worksheet['!cols'] =
      viewMode === 'Daily'
        ? [
            { wch: 24 },
            { wch: 18 },
            { wch: 18 },
            { wch: 20 },
            { wch: 18 },
            { wch: 20 },
            { wch: 20 },
          ]
        : [
            { wch: 24 },
            { wch: 18 },

            ...Object.keys(rows[0])
              .slice(2)
              .map(() => ({
                wch: 18,
              })),
          ];

    /*
    |--------------------------------------------------------------------------
    | File Name
    |--------------------------------------------------------------------------
    */

    const fileName =
      viewMode === 'Daily'
        ? `Attendance-${selectedDate.format('DD-MM-YYYY')}.xlsx`
        : viewMode === 'Weekly'
          ? `Attendance-${getDateLabel().replace(/[^a-zA-Z0-9-]/g, '_')}.xlsx`
          : `Attendance-${selectedDate.format('MMMM-YYYY')}.xlsx`;

    XLSX.writeFile(workbook, fileName);
  };

  /*
  |--------------------------------------------------------------------------
  | UI
  |--------------------------------------------------------------------------
  */

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}

      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Attendance Roster</h1>

        <p className="mt-1 text-slate-500">
          Manage and review employee attendance by day, week, or month.
        </p>
      </div>

      {/* Controls */}

      <Card className="rounded-2xl border-0 shadow-sm">
        <div className="flex flex-col gap-5">
          <Row gutter={[16, 16]} align="middle">
            {/* Search */}

            <Col xs={24} md={9} lg={7}>
              <Input
                size="large"
                allowClear
                prefix={<SearchOutlined className="text-slate-400" />}
                placeholder="Search employee..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="rounded-lg"
              />
            </Col>

            {/* View */}

            <Col xs={24} md={8} lg={7}>
              <Segmented
                block
                size="large"
                value={viewMode}
                onChange={(value) => setViewMode(value as ViewMode)}
                options={[
                  {
                    label: 'Daily',
                    value: 'Daily',
                  },
                  {
                    label: 'Weekly',
                    value: 'Weekly',
                  },
                  {
                    label: 'Monthly',
                    value: 'Monthly',
                  },
                ]}
              />
            </Col>

            {/* Date */}

            <Col xs={24} md={7} lg={6}>
              <DatePicker
                size="large"
                value={selectedDate}
                onChange={(date) => {
                  if (date) {
                    setSelectedDate(date);
                  }
                }}
                picker={viewMode === 'Monthly' ? 'month' : 'date'}
                format={viewMode === 'Monthly' ? 'MMMM YYYY' : 'DD MMM YYYY'}
                className="w-full rounded-lg"
                suffixIcon={<CalendarOutlined />}
              />
            </Col>

            {/* Today */}

            <Col xs={24} md={24} lg={4}>
              <Button size="large" block onClick={goToday} className="rounded-lg">
                Today
              </Button>
            </Col>

            {/* Export */}

            <Col xs={24} md={24} lg={4}>
              <Button
                size="large"
                block
                icon={<FileExcelOutlined />}
                onClick={exportToExcel}
                className="rounded-lg"
              >
                Export Excel
              </Button>
            </Col>
          </Row>

          {/* Navigation */}

          <div className="flex flex-col gap-4 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-medium text-slate-400">{viewMode} View</div>

              <div className="mt-1 text-xl font-bold text-slate-900">{getDateLabel()}</div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="large"
                icon={<LeftOutlined />}
                onClick={previousPeriod}
                className="rounded-lg"
              />

              <Button
                size="large"
                icon={<RightOutlined />}
                onClick={nextPeriod}
                className="rounded-lg"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Legend */}

      <Card className="rounded-2xl border-0 shadow-sm">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <span className="text-sm font-semibold text-slate-700">Attendance Status</span>

            {/* P */}

            <div className="flex items-center gap-2">
              <span className="flex h-7 min-w-7 items-center justify-center rounded-md border border-green-200 bg-green-100 px-1.5 text-xs font-bold text-green-700">
                P
              </span>

              <span className="text-sm text-slate-500">Present</span>
            </div>

            {/* WO */}

            <div className="flex items-center gap-2">
              <span className="flex h-7 min-w-7 items-center justify-center rounded-md border border-slate-200 bg-slate-100 px-1.5 text-xs font-bold text-slate-500">
                WO
              </span>

              <span className="text-sm text-slate-500">Week Off</span>
            </div>

            {/* L */}

            <div className="flex items-center gap-2">
              <span className="flex h-7 min-w-7 items-center justify-center rounded-md border border-yellow-200 bg-yellow-100 px-1.5 text-xs font-bold text-yellow-700">
                L
              </span>

              <span className="text-sm text-slate-500">Leave</span>
            </div>

            {/* H */}

            <div className="flex items-center gap-2">
              <span className="flex h-7 min-w-7 items-center justify-center rounded-md border border-purple-200 bg-purple-100 px-1.5 text-xs font-bold text-purple-700">
                H
              </span>

              <span className="text-sm text-slate-500">Holiday</span>
            </div>

            {/* HD */}

            <div className="flex items-center gap-2">
              <span className="flex h-7 min-w-7 items-center justify-center rounded-md border border-orange-200 bg-orange-100 px-1.5 text-xs font-bold text-orange-700">
                HD
              </span>

              <span className="text-sm text-slate-500">Half Day</span>
            </div>

            {/* OD */}

            <div className="flex items-center gap-2">
              <span className="flex h-7 min-w-7 items-center justify-center rounded-md border border-cyan-200 bg-cyan-100 px-1.5 text-xs font-bold text-cyan-700">
                OD
              </span>

              <span className="text-sm text-slate-500">On Duty</span>
            </div>

            {/* WFH */}

            <div className="flex items-center gap-2">
              <span className="flex h-7 min-w-7 items-center justify-center rounded-md border border-indigo-200 bg-indigo-100 px-1.5 text-xs font-bold text-indigo-700">
                WFH
              </span>

              <span className="text-sm text-slate-500">Work From Home</span>
            </div>

            {/* SL */}

            <div className="flex items-center gap-2">
              <span className="flex h-7 min-w-7 items-center justify-center rounded-md border border-blue-200 bg-blue-100 px-1.5 text-xs font-bold text-blue-700">
                SL
              </span>

              <span className="text-sm text-slate-500">Short Login</span>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3 text-xs text-slate-400">
            SL is automatically generated from actual login/working time.
          </div>
        </div>
      </Card>

      {/* Employee Roster */}

      <Card
        title={
          <div>
            <div className="text-lg font-semibold text-slate-900">Employee Roster</div>

            <div className="mt-1 text-sm font-normal text-slate-400">{roster.length} employees</div>
          </div>
        }
        className="overflow-hidden rounded-2xl border-0 shadow-sm"
        styles={{
          body: {
            padding: 0,
          },
        }}
      >
        <Table<RosterUser>
          rowKey={(record) => record.employee._id}
          columns={columns}
          dataSource={roster}
          loading={loading}
          bordered
          scroll={{
            x: viewMode === 'Monthly' ? 'max-content' : viewMode === 'Weekly' ? 900 : 700,
          }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['10', '25', '50', '100'],
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} employees`,
          }}
        />
      </Card>
    </div>
  );
}
