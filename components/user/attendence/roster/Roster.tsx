'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, Col, Row, Table, Tag, Typography, message } from 'antd';
import {
  CalendarOutlined,
  CalendarTwoTone,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CoffeeOutlined,
  HomeOutlined,
} from '@ant-design/icons';

import dayjs, { Dayjs } from 'dayjs';
import weekday from 'dayjs/plugin/weekday';
import updateLocale from 'dayjs/plugin/updateLocale';

dayjs.extend(weekday);
dayjs.extend(updateLocale);

dayjs.updateLocale('en', {
  weekStart: 1,
});

const { Title, Text } = Typography;

/*
|--------------------------------------------------------------------------
| Types
|--------------------------------------------------------------------------
*/

type RosterStatus = 'P' | 'WO' | 'L' | 'H' | 'HD' | 'A' | 'OD' | 'WFH';

interface RosterRecord {
  _id: string;
  employee: string;
  date: string;
  rosterStatus: RosterStatus;
  status: 'active' | 'inactive';
}

interface Employee {
  _id: string;
  employeeId: string;
  name: string;
  email: string;
}

/*
|--------------------------------------------------------------------------
| Status Configuration
|--------------------------------------------------------------------------
*/

const STATUS_CONFIG: Record<
  RosterStatus,
  {
    label: string;
    color: string;
  }
> = {
  P: {
    label: 'Present',
    color: 'green',
  },

  WO: {
    label: 'Weekly Off',
    color: 'orange',
  },

  L: {
    label: 'Leave',
    color: 'blue',
  },

  H: {
    label: 'Holiday',
    color: 'red',
  },

  HD: {
    label: 'Half Day',
    color: 'purple',
  },

  A: {
    label: 'Absent',
    color: 'volcano',
  },

  OD: {
    label: 'On Duty',
    color: 'cyan',
  },

  WFH: {
    label: 'Work From Home',
    color: 'geekblue',
  },
};

/*
|--------------------------------------------------------------------------
| Component
|--------------------------------------------------------------------------
*/

export default function Roster() {
  const [messageApi, contextHolder] = message.useMessage();

  /*
   * Current week.
   *
   * Starts from today's date.
   */
  const [currentWeek, setCurrentWeek] = useState<Dayjs>(() => dayjs());

  const [employee, setEmployee] = useState<Employee | null>(null);

  const [roster, setRoster] = useState<RosterRecord[]>([]);

  const [loading, setLoading] = useState(true);

  /*
  |--------------------------------------------------------------------------
  | Week calculation
  |--------------------------------------------------------------------------
  */

  const startOfWeek = useMemo(() => {
    return currentWeek.startOf('week');
  }, [currentWeek]);

  const endOfWeek = useMemo(() => {
    return startOfWeek.add(6, 'day');
  }, [startOfWeek]);

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, index) => startOfWeek.add(index, 'day'));
  }, [startOfWeek]);

  /*
  |--------------------------------------------------------------------------
  | Current date
  |--------------------------------------------------------------------------
  */

  const today = dayjs().format('YYYY-MM-DD');

  /*
  |--------------------------------------------------------------------------
  | Automatically detect new week
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const checkWeek = () => {
      const currentDate = dayjs();

      const todayWeek = currentDate.startOf('week');

      setCurrentWeek((previousWeek) => {
        const previousWeekStart = previousWeek.startOf('week');

        if (!todayWeek.isSame(previousWeekStart, 'day')) {
          return currentDate;
        }

        return previousWeek;
      });
    };

    checkWeek();

    const interval = setInterval(checkWeek, 60 * 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Fetch user's roster
  |--------------------------------------------------------------------------
  */

  const fetchRoster = useCallback(async () => {
    try {
      setLoading(true);

      const startDate = startOfWeek.format('YYYY-MM-DD');

      const endDate = endOfWeek.format('YYYY-MM-DD');

      const response = await fetch(
        `/api/employee/attendance/userRoster?startDate=${startDate}&endDate=${endDate}`,
        {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to fetch roster.');
      }

      setEmployee(result.employee || null);

      setRoster(result.data || []);
    } catch (error) {
      console.error('Failed to fetch roster:', error);

      setEmployee(null);

      setRoster([]);

      messageApi.error(error instanceof Error ? error.message : 'Failed to load roster.');
    } finally {
      setLoading(false);
    }
  }, [startOfWeek, endOfWeek, messageApi]);

  /*
  |--------------------------------------------------------------------------
  | Fetch whenever week changes
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    fetchRoster();
  }, [fetchRoster]);

  /*
  |--------------------------------------------------------------------------
  | Refresh roster periodically
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const interval = setInterval(() => {
      fetchRoster();
    }, 60 * 1000);

    return () => {
      clearInterval(interval);
    };
  }, [fetchRoster]);

  /*
  |--------------------------------------------------------------------------
  | Refresh when browser tab becomes active
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchRoster();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchRoster]);

  /*
  |--------------------------------------------------------------------------
  | Roster Map
  |--------------------------------------------------------------------------
  */

  const rosterMap = useMemo(() => {
    const map = new Map<string, RosterRecord>();

    roster.forEach((record) => {
      map.set(dayjs(record.date).format('YYYY-MM-DD'), record);
    });

    return map;
  }, [roster]);

  /*
  |--------------------------------------------------------------------------
  | Weekly Calendar Data
  |--------------------------------------------------------------------------
  */

  const week = useMemo(() => {
    return weekDays.map((day) => {
      const date = day.format('YYYY-MM-DD');

      const record = rosterMap.get(date);

      const status = record?.rosterStatus || null;

      const config = status ? STATUS_CONFIG[status] : null;

      return {
        key: date,

        date,

        day: day.format('ddd'),

        dateNumber: day.format('DD'),

        month: day.format('MMM'),

        fullDate: day.format('DD MMM YYYY'),

        status,

        label: config?.label || 'Not Assigned',

        color: config?.color || 'default',

        isToday: date === today,
      };
    });
  }, [weekDays, rosterMap, today]);

  /*
  |--------------------------------------------------------------------------
  | Summary
  |--------------------------------------------------------------------------
  */

  const stats = useMemo(() => {
    const count = (status: RosterStatus) => {
      return roster.filter((record) => record.rosterStatus === status).length;
    };

    return [
      {
        title: 'Working',
        value: count('P'),
        color: 'text-green-600',
        icon: <CheckCircleOutlined className="text-2xl text-green-600" />,
      },

      {
        title: 'Weekly Off',
        value: count('WO'),
        color: 'text-orange-500',
        icon: <CoffeeOutlined className="text-2xl text-orange-500" />,
      },

      {
        title: 'Leave',
        value: count('L'),
        color: 'text-blue-600',
        icon: <CalendarTwoTone twoToneColor="#2563eb" className="text-2xl" />,
      },

      {
        title: 'Holiday',
        value: count('H'),
        color: 'text-red-500',
        icon: <HomeOutlined className="text-2xl text-red-500" />,
      },
    ];
  }, [roster]);

  /*
  |--------------------------------------------------------------------------
  | Table Data
  |--------------------------------------------------------------------------
  */

  const tableData = useMemo(() => {
    return week.map((item) => ({
      key: item.key,

      date: item.fullDate,

      day: item.day,

      status: item.status,

      label: item.label,

      color: item.color,
    }));
  }, [week]);

  /*
  |--------------------------------------------------------------------------
  | Table Columns
  |--------------------------------------------------------------------------
  */

const columns = useMemo(
  () => [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      width: '33.33%',
      render: (date: string) => <span className="font-medium text-slate-700">{date}</span>,
    },

    {
      title: 'Day',
      dataIndex: 'day',
      key: 'day',
      width: '33.33%',
      render: (day: string) => <span className="text-slate-600">{day}</span>,
    },

    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: '33.33%',
      render: (
        status: RosterStatus | null,
        record: {
          label: string;
          color: string;
        }
      ) => {
        if (!status) {
          return <Tag className="px-3 py-1">Not Assigned</Tag>;
        }

        return (
          <Tag color={record.color} className="px-3 py-1 text-sm">
            {status} - {record.label}
          </Tag>
        );
      },
    },
  ],
  []
);

  /*
  |--------------------------------------------------------------------------
  | UI
  |--------------------------------------------------------------------------
  */

  return (
    <>
      {contextHolder}

      <div className="flex flex-col gap-8">
        {/* Header */}
        <div>
          <Title level={2} className="!mb-1">
            My Work Schedule
          </Title>

          <Text type="secondary">
            {employee
              ? `Weekly roster for ${employee.name}`
              : 'View your weekly roster, attendance availability, and upcoming work schedule.'}
          </Text>
        </div>

        {/* Weekly Calendar */}
        <Card
          title={
            <div className="flex items-center gap-2">
              <span>This Week</span>

              <span className="text-sm font-normal text-slate-500">
                {startOfWeek.format('DD MMM')} - {endOfWeek.format('DD MMM YYYY')}
              </span>
            </div>
          }
          extra={<CalendarOutlined className="text-lg" />}
          className="rounded-xl"
          loading={loading}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
            {week.map((item) => (
              <Card
                key={item.key}
                hoverable
                className={`
                  h-full rounded-xl
                  transition-all duration-200
                  hover:-translate-y-1
                  ${
                    item.isToday
                      ? 'border-2 border-blue-500 bg-blue-50 shadow-md'
                      : 'border border-slate-200'
                  }
                `}
                styles={{
                  body: {
                    padding: 20,
                  },
                }}
              >
                <div className="text-center">
                  <div className={item.isToday ? 'font-semibold text-blue-600' : ''}>
                    <Text type="secondary">{item.day}</Text>
                  </div>

                  <div
                    className={`
                      my-3 text-3xl font-bold
                      ${item.isToday ? 'text-blue-600' : 'text-slate-800'}
                    `}
                  >
                    {item.dateNumber}
                  </div>

                  <Text type="secondary" className="mb-3 block">
                    {item.month}
                  </Text>

                  {item.status ? (
                    <Tag color={item.color}>
                      {item.status} - {item.label}
                    </Tag>
                  ) : (
                    <Tag>Not Assigned</Tag>
                  )}

                  {item.isToday && (
                    <div className="mt-3">
                      <span className="rounded-full bg-blue-600 px-2.5 py-1 text-[10px] font-semibold text-white">
                        TODAY
                      </span>
                    </div>
                  )}
                </div>
              </Card>
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
          title={
            <div className="flex items-center gap-2">
              <ClockCircleOutlined className="text-lg" />
              <span>Upcoming Schedule</span>
            </div>
          }
          className="rounded-xl"
          loading={loading}
        >
          <Table
            rowKey="key"
            columns={columns}
            dataSource={tableData}
            pagination={false}
            className="roster-table"
            tableLayout="fixed"
          />
        </Card>
      </div>
    </>
  );
}
