'use client';

import { useParams, useRouter } from 'next/navigation';
import { Avatar, Button, Card, DatePicker, Divider, Tag } from 'antd';

import {
  ArrowLeftOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';

import dayjs from 'dayjs';

export default function UserAttendance() {
  const params = useParams();
  const router = useRouter();

  const userId = params.userId as string;

  const employee = {
    name: 'Tarun Kumar',
    email: 'tarun@example.com',
  };

  const initials = employee.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase();

  const attendance = [
    {
      date: '01 Sep 2026',
      day: 'Tuesday',
      am: true,
      pm: true,
      breakTime: '45m',
      total: '8h 15m',
    },
    {
      date: '02 Sep 2026',
      day: 'Wednesday',
      am: true,
      pm: true,
      breakTime: '30m',
      total: '8h 30m',
    },
    {
      date: '03 Sep 2026',
      day: 'Thursday',
      am: true,
      pm: false,
      breakTime: '20m',
      total: '4h 10m',
    },
    {
      date: '04 Sep 2026',
      day: 'Friday',
      am: true,
      pm: true,
      breakTime: '40m',
      total: '8h 05m',
    },
    {
      date: '05 Sep 2026',
      day: 'Saturday',
      am: false,
      pm: false,
      breakTime: '—',
      total: '—',
    },
    {
      date: '06 Sep 2026',
      day: 'Sunday',
      am: false,
      pm: false,
      breakTime: '—',
      total: '—',
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">

          <div>
            <h1 className="text-3xl font-bold text-slate-900">Employee Attendance</h1>

            <p className="mt-1 text-slate-500">Attendance roster</p>
          </div>
        </div>

        <DatePicker
          size="large"
          picker="month"
          defaultValue={dayjs()}
          format="MMMM YYYY"
          allowClear={false}
          suffixIcon={<CalendarOutlined />}
        />
      </div>

      {/* Employee */}
      <Card className="rounded-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar size={64} className="bg-[#0f172a] text-lg font-semibold text-white">
              {initials}
            </Avatar>

            <div>
              <h2 className="text-xl font-semibold text-slate-900">{employee.name}</h2>

              <p className="mt-1 text-sm text-slate-500">{employee.email}</p>

              <p className="mt-1 text-xs text-slate-400">User ID: {userId}</p>
            </div>
          </div>

          <Tag color="success" icon={<CheckCircleOutlined />} className="m-0 w-fit px-3 py-1">
            Active
          </Tag>
        </div>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="rounded-xl">
          <div className="text-sm text-slate-500">Present</div>

          <div className="mt-2 text-2xl font-bold text-slate-900">18</div>
        </Card>

        <Card className="rounded-xl">
          <div className="text-sm text-slate-500">Absent</div>

          <div className="mt-2 text-2xl font-bold text-slate-900">2</div>
        </Card>

        <Card className="rounded-xl">
          <div className="text-sm text-slate-500">Total Hours</div>

          <div className="mt-2 text-2xl font-bold text-slate-900">148h 20m</div>
        </Card>

        <Card className="rounded-xl">
          <div className="text-sm text-slate-500">Avg. Daily</div>

          <div className="mt-2 text-2xl font-bold text-slate-900">8h 14m</div>
        </Card>
      </div>

      {/* Roster */}
      <Card
        title={
          <div>
            <div className="text-lg font-semibold text-slate-900">Attendance Roster</div>

            <div className="mt-1 text-sm font-normal text-slate-500">September 2026</div>
          </div>
        }
        className="rounded-xl"
        styles={{
          body: {
            padding: 0,
          },
        }}
      >
        {/* Desktop Header */}
        <div className="hidden border-b border-slate-200 bg-slate-50 px-5 py-3 lg:grid lg:grid-cols-[1.5fr_1fr_1fr_1fr_1fr_1fr] lg:items-center lg:gap-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Date</div>

          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Day</div>

          <div className="text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
            AM
          </div>

          <div className="text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
            PM
          </div>

          <div className="text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
            Break
          </div>

          <div className="text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
            Total
          </div>
        </div>

        {/* Rows */}
        {attendance.map((item, index) => (
          <div
            key={index}
            className="border-b border-slate-200 px-5 py-4 last:border-b-0 hover:bg-slate-50"
          >
            {/* Desktop */}
            <div className="hidden lg:grid lg:grid-cols-[1.5fr_1fr_1fr_1fr_1fr_1fr] lg:items-center lg:gap-4">
              <div className="font-medium text-slate-800">{item.date}</div>

              <div className="text-sm text-slate-500">{item.day}</div>

              <div className="flex justify-center">
                {item.am ? (
                  <CheckCircleOutlined className="text-lg text-green-500" />
                ) : (
                  <CloseCircleOutlined className="text-lg text-slate-300" />
                )}
              </div>

              <div className="flex justify-center">
                {item.pm ? (
                  <CheckCircleOutlined className="text-lg text-green-500" />
                ) : (
                  <CloseCircleOutlined className="text-lg text-slate-300" />
                )}
              </div>

              <div className="text-center text-sm text-slate-600">{item.breakTime}</div>

              <div className="text-right font-semibold text-slate-800">{item.total}</div>
            </div>

            {/* Mobile */}
            <div className="lg:hidden">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-slate-800">{item.date}</div>

                  <div className="mt-1 text-sm text-slate-500">{item.day}</div>
                </div>

                {item.am || item.pm ? <Tag color="success">Present</Tag> : <Tag>Absent</Tag>}
              </div>

              <Divider className="my-3" />

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <div className="text-xs text-slate-400">AM</div>

                  <div className="mt-1">
                    {item.am ? (
                      <CheckCircleOutlined className="text-green-500" />
                    ) : (
                      <CloseCircleOutlined className="text-slate-300" />
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-slate-400">PM</div>

                  <div className="mt-1">
                    {item.pm ? (
                      <CheckCircleOutlined className="text-green-500" />
                    ) : (
                      <CloseCircleOutlined className="text-slate-300" />
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-slate-400">Total</div>

                  <div className="mt-1 font-semibold text-slate-800">{item.total}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}
