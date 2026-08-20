'use client';

import { Calendar, Card, Empty, Spin, Tag, Tooltip, message } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';

type HolidayType = 'National' | 'Festival' | 'Company' | 'Optional' | 'Weekend';

interface Holiday {
  _id: string;
  title: string;
  date: string;
  description: string;
  holidayType: HolidayType;
  isOptional: boolean;
  isRecurring: boolean;
  status: 'active' | 'inactive';
}

interface CalendarCellInfo {
  type: 'date' | 'month' | 'year' | 'decade' | 'time' | string;
  originNode: React.ReactNode;
}

export default function Holidays() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);

  /*
   * Fetch holidays
   */
  const fetchHolidays = async () => {
    try {
      setLoading(true);

      const response = await fetch('/api/admin/attendance/holidays?status=active', {
        method: 'GET',
        cache: 'no-store',
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to fetch holidays.');
      }

      setHolidays(result.data || []);
    } catch (error) {
      console.error('Holiday fetch error:', error);

      message.error(error instanceof Error ? error.message : 'Failed to fetch holidays.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  /*
   * Holiday lookup
   *
   * YYYY-MM-DD
   *      ↓
   * Holiday
   */
  const holidayMap = useMemo(() => {
    const map = new Map<string, Holiday>();

    holidays.forEach((holiday) => {
      map.set(dayjs(holiday.date).format('YYYY-MM-DD'), holiday);
    });

    return map;
  }, [holidays]);

  /*
   * Holiday color
   */
  const getHolidayColor = (type: HolidayType) => {
    switch (type) {
      case 'National':
        return 'red';

      case 'Festival':
        return 'green';

      case 'Optional':
        return 'orange';

      case 'Weekend':
        return 'purple';

      case 'Company':
      default:
        return 'blue';
    }
  };

  /*
   * Calendar cell renderer
   *
   * This replaces both:
   *
   * dateCellRender
   * monthCellRender
   *
   * No deprecated Ant Design API is used.
   */
  const cellRender = (current: Dayjs, info: CalendarCellInfo) => {
    if (info.type === 'date') {
      const dateKey = current.format('YYYY-MM-DD');

      const holiday = holidayMap.get(dateKey);

      /*
       * Only render holiday information.
       *
       * Ant Design already renders the date number.
       */
      if (!holiday) {
        return null;
      }

      return (
        <Tooltip
          placement="top"
          title={
            <div className="py-1">
              <div className="font-semibold">{holiday.title}</div>

              <div className="mt-1 text-xs">{holiday.holidayType}</div>

              {holiday.description && <div className="mt-1 text-xs">{holiday.description}</div>}
            </div>
          }
        >
          <div className="mt-1 cursor-pointer px-1">
            <Tag
              color={getHolidayColor(holiday.holidayType)}
              className="
              m-0
              block
              max-w-full
              overflow-hidden
              text-ellipsis
              whitespace-nowrap
              rounded-full
              px-2
              text-[11px]
            "
            >
              {holiday.title}
            </Tag>
          </div>
        </Tooltip>
      );
    }

    if (info.type === 'month') {
      const monthKey = current.format('YYYY-MM');

      const monthHolidays = holidays.filter(
        (holiday) => dayjs(holiday.date).format('YYYY-MM') === monthKey
      );

      if (monthHolidays.length === 0) {
        return null;
      }

      return (
        <div className="text-center">
          <Tag color="blue" className="text-xs">
            {monthHolidays.length} {monthHolidays.length === 1 ? 'Holiday' : 'Holidays'}
          </Tag>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Holiday Calendar</h1>

        <p className="mt-1 text-slate-500">View company holidays and upcoming public holidays.</p>
      </div>

      {/* Calendar */}
      <Card
        className="rounded-xl"
        title={
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">Holiday Calendar</span>

            <span className="text-sm font-normal text-slate-500">
              {holidays.length} {holidays.length === 1 ? 'holiday' : 'holidays'}
            </span>
          </div>
        }
      >
        {loading ? (
          <div className="flex min-h-[600px] items-center justify-center">
            <Spin size="large" />
          </div>
        ) : (
          <>
            <Calendar fullscreen cellRender={cellRender} />

            {holidays.length === 0 && (
              <div className="mt-4">
                <Empty description="No holidays assigned" />
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
