'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button, Card, Timeline, Tag } from 'antd';
import { CoffeeOutlined, PauseCircleOutlined, PlayCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

interface BreakRecord {
  id: string;
  start: string;
  end: string | null;
}

interface TodayAttendance {
  _id: string;
  checkIn: string | null;
  checkOut: string | null;
  currentStatus: 'Working' | 'On Break' | 'Checked Out';
  workingMinutes: number;
  breakMinutes: number;
}

export default function Mark() {
  const [attendance, setAttendance] = useState<TodayAttendance | null>(null);

  const [breaks, setBreaks] = useState<BreakRecord[]>([]);

  const [currentTime, setCurrentTime] = useState(new Date());

  const [loading, setLoading] = useState(false);

  /*
   * Live clock
   */
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  /*
   * Fetch today's attendance
   */
  const fetchAttendance = async () => {
    try {
      setLoading(true);

      const response = await fetch('/api/admin/attendance/today', {
        cache: 'no-store',
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to fetch attendance.');
      }

      setAttendance(result.data || null);

      /*
       * If your API also returns logs,
       * populate breaks here.
       */
      setBreaks(result.breaks || []);
    } catch (error) {
      console.error('Attendance fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  /*
   * Format time
   */
  const formatTime = (value: string | Date | null) => {
    if (!value) {
      return '--';
    }

    return dayjs(value).format('hh:mm:ss A');
  };

  /*
   * Working timer
   *
   * Before checkout:
   * check-in → current time
   *
   * After checkout:
   * check-in → checkout
   */
  const workingTime = useMemo(() => {
    if (!attendance?.checkIn) {
      return '00:00:00';
    }

    const start = dayjs(attendance.checkIn);

    const end = attendance.checkOut ? dayjs(attendance.checkOut) : dayjs(currentTime);

    const seconds = Math.max(0, end.diff(start, 'second'));

    const hours = Math.floor(seconds / 3600);

    const minutes = Math.floor((seconds % 3600) / 60);

    const remainingSeconds = seconds % 60;

    return [
      String(hours).padStart(2, '0'),
      String(minutes).padStart(2, '0'),
      String(remainingSeconds).padStart(2, '0'),
    ].join(':');
  }, [attendance, currentTime]);

  /*
   * Take Break
   */
  const handleTakeBreak = async () => {
    if (!attendance?._id) {
      return;
    }

    if (attendance.currentStatus === 'On Break') {
      return;
    }

    try {
      setLoading(true);

      const response = await fetch('/api/admin/attendance/break', {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({
          attendanceId: attendance._id,
          type: 'BREAK_IN',
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to start break.');
      }

      await fetchAttendance();
    } catch (error) {
      console.error('Break start error:', error);
    } finally {
      setLoading(false);
    }
  };

  /*
   * Break Off
   */
  const handleBreakOff = async () => {
    if (!attendance?._id) {
      return;
    }

    if (attendance.currentStatus !== 'On Break') {
      return;
    }

    try {
      setLoading(true);

      const response = await fetch('/api/admin/attendance/break', {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({
          attendanceId: attendance._id,
          type: 'BREAK_OUT',
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to end break.');
      }

      await fetchAttendance();
    } catch (error) {
      console.error('Break end error:', error);
    } finally {
      setLoading(false);
    }
  };

  /*
   * Timeline
   */
  const timelineItems = [
    ...breaks.map((item) => ({
      color: 'green',

      dot: <CoffeeOutlined />,

      content: (
        <div>
          <div className="font-medium text-slate-700">Break</div>

          <div className="text-sm text-slate-500">
            {formatTime(item.start)} {item.end ? `- ${formatTime(item.end)}` : ''}
          </div>
        </div>
      ),
    })),

    ...(attendance?.currentStatus === 'On Break'
      ? [
          {
            color: 'orange',

            dot: <PauseCircleOutlined />,

            content: (
              <div>
                <div className="font-medium text-orange-600">Break in Progress</div>

                <div className="text-sm text-slate-500">Break is currently active</div>
              </div>
            ),
          },
        ]
      : []),

    ...(breaks.length === 0 && attendance?.currentStatus !== 'On Break'
      ? [
          {
            color: 'gray',
            content: 'No breaks recorded.',
          },
        ]
      : []),
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Mark Attendance</h1>

        <p className="text-slate-500">Manage your breaks and track today's working hours.</p>
      </div>

      {/* Attendance */}
      <Card className="rounded-xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm text-slate-500">Checked In At</div>

            <div className="mt-1 text-2xl font-bold text-slate-800">
              {formatTime(attendance?.checkIn || null)}
            </div>

            <div className="mt-2">
              <Tag
                color={
                  attendance?.currentStatus === 'On Break'
                    ? 'orange'
                    : attendance?.currentStatus === 'Working'
                      ? 'blue'
                      : 'green'
                }
              >
                {attendance?.currentStatus || 'Not Checked In'}
              </Tag>
            </div>
          </div>

          <div className="text-left md:text-right">
            <div className="text-sm text-slate-500">Working Time</div>

            <div className="mt-1 font-mono text-3xl font-bold text-green-600">{workingTime}</div>
          </div>
        </div>
      </Card>

      {/* Break Action */}
      <Card title="Today's Attendance" className="rounded-xl">
        {attendance?.currentStatus === 'On Break' ? (
          <Button
            type="primary"
            danger
            size="large"
            icon={<PauseCircleOutlined />}
            loading={loading}
            onClick={handleBreakOff}
          >
            Break Off
          </Button>
        ) : attendance?.currentStatus === 'Working' ? (
          <Button
            type="primary"
            size="large"
            icon={<PlayCircleOutlined />}
            loading={loading}
            onClick={handleTakeBreak}
          >
            Take Break
          </Button>
        ) : (
          <Tag color="green">Attendance Completed</Tag>
        )}
      </Card>

      {/* Break History */}
      <Card
        title={
          <div className="flex items-center gap-2">
            <CoffeeOutlined />
            <span>Today's Breaks</span>
          </div>
        }
        className="rounded-xl"
      >
        <Timeline items={timelineItems} />
      </Card>
    </div>
  );
}
