'use client';

import { Dispatch, SetStateAction } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import weekday from 'dayjs/plugin/weekday';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import updateLocale from 'dayjs/plugin/updateLocale';

import { Button, DatePicker, Input, Select, Space } from 'antd';
import {
  CalendarOutlined,
  LeftOutlined,
  RightOutlined,
  SaveOutlined,
  SearchOutlined,
} from '@ant-design/icons';

dayjs.extend(weekday);
dayjs.extend(weekOfYear);
dayjs.extend(updateLocale);

dayjs.updateLocale('en', {
  weekStart: 1,
});

interface RosterControlsProps {
  currentWeek: Dayjs;
  setCurrentWeek: Dispatch<SetStateAction<Dayjs>>;
}

export default function RosterControls({ currentWeek, setCurrentWeek }: RosterControlsProps) {
  const startOfWeek = currentWeek.startOf('week');
  const endOfWeek = currentWeek.endOf('week');

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {/* Top */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Weekly Roster</h1>

          <p className="mt-1 text-sm text-slate-500">Assign shifts, leave and weekly offs.</p>
        </div>

        <Button type="primary" size="large" icon={<SaveOutlined />} className="px-6">
          Save Changes
        </Button>
      </div>

      {/* Week Navigation */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50 px-5 py-4">
        <Button
          icon={<LeftOutlined />}
          onClick={() => setCurrentWeek(currentWeek.subtract(1, 'week'))}
        />

        <div className="text-center">
          <div className="text-lg font-semibold text-slate-800">
            {startOfWeek.format('DD MMM YYYY')} – {endOfWeek.format('DD MMM YYYY')}
          </div>

          <div className="text-sm text-slate-500">Week {currentWeek.week()}</div>
        </div>

        <Button
          icon={<RightOutlined />}
          onClick={() => setCurrentWeek(currentWeek.add(1, 'week'))}
        />
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <Space wrap size="middle">
          <DatePicker
            picker="week"
            size="large"
            value={currentWeek}
            onChange={(date) => {
              if (date) setCurrentWeek(date);
            }}
            suffixIcon={<CalendarOutlined />}
          />

          <Select
            className="w-48"
            size="large"
            placeholder="Department"
            options={[
              { label: 'All Departments', value: 'all' },
              { label: 'IT', value: 'IT' },
              { label: 'Sales', value: 'Sales' },
              { label: 'HR', value: 'HR' },
              { label: 'Accounts', value: 'Accounts' },
            ]}
          />

          <Input
            className="w-72"
            size="large"
            placeholder="Search employee..."
            prefix={<SearchOutlined />}
          />
        </Space>
      </div>
    </div>
  );
}
