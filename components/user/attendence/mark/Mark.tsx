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

type SessionStatus = 'Working' | 'On Break' | 'Checked Out';

interface AttendanceSession {
  checkIn: string | null;
  checkOut: string | null;

  currentStatus: SessionStatus;

  lastActivityAt: string | null;

  workingMinutes: number;

  breakMinutes: number;

  autoLogoutAt?: string | null;
}

interface TodayAttendance {
  _id: string;

  am: AttendanceSession;

  pm: AttendanceSession;

  status: 'Present' | 'Absent' | 'Half Day' | 'Leave' | 'Holiday' | 'Weekly Off';
}

type SessionType = 'am' | 'pm';

export default function Mark() {
  const [attendance, setAttendance] = useState<TodayAttendance | null>(null);

  const [session, setSession] = useState<SessionType | null>(null);

  const [breaks, setBreaks] = useState<BreakRecord[]>([]);

  const [currentTime, setCurrentTime] = useState(new Date());

  const [loading, setLoading] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | Live Clock
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Current AM / PM Session
  |--------------------------------------------------------------------------
  */

  const currentSession = useMemo(() => {
    if (!attendance || !session) {
      return null;
    }

    return attendance[session];
  }, [attendance, session]);

  /*
  |--------------------------------------------------------------------------
  | Fetch Today's Attendance
  |--------------------------------------------------------------------------
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

      setSession(result.session || null);

      setBreaks(result.breaks || []);
    } catch (error) {
      console.error('Attendance fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Initial Load
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    fetchAttendance();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Format Time
  |--------------------------------------------------------------------------
  */

  const formatTime = (value: string | Date | null) => {
    if (!value) {
      return '--';
    }

    return dayjs(value).format('hh:mm:ss A');
  };

  /*
  |--------------------------------------------------------------------------
  | Working Timer
  |--------------------------------------------------------------------------
  |
  | Only calculate the CURRENT AM/PM session.
  |
  */

  const workingTime = useMemo(() => {
    if (!currentSession?.checkIn) {
      return '00:00:00';
    }

    const start = dayjs(currentSession.checkIn);

    const end = currentSession.checkOut ? dayjs(currentSession.checkOut) : dayjs(currentTime);

    const seconds = Math.max(0, end.diff(start, 'second'));

    const hours = Math.floor(seconds / 3600);

    const minutes = Math.floor((seconds % 3600) / 60);

    const remainingSeconds = seconds % 60;

    return [
      String(hours).padStart(2, '0'),
      String(minutes).padStart(2, '0'),
      String(remainingSeconds).padStart(2, '0'),
    ].join(':');
  }, [currentSession, currentTime]);

  /*
  |--------------------------------------------------------------------------
  | Take Break
  |--------------------------------------------------------------------------
  */

  const handleTakeBreak = async () => {
    if (!attendance?._id || !currentSession) {
      return;
    }

    if (currentSession.currentStatus === 'On Break') {
      return;
    }

    if (currentSession.currentStatus !== 'Working') {
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
  |--------------------------------------------------------------------------
  | Break Off
  |--------------------------------------------------------------------------
  */

  const handleBreakOff = async () => {
    if (!attendance?._id || !currentSession) {
      return;
    }

    if (currentSession.currentStatus !== 'On Break') {
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
  |--------------------------------------------------------------------------
  | Status Color
  |--------------------------------------------------------------------------
  */

  const statusColor = useMemo(() => {
    if (!currentSession) {
      return 'default';
    }

    switch (currentSession.currentStatus) {
      case 'Working':
        return 'blue';

      case 'On Break':
        return 'orange';

      case 'Checked Out':
        return 'green';

      default:
        return 'default';
    }
  }, [currentSession]);

  /*
  |--------------------------------------------------------------------------
  | Timeline
  |--------------------------------------------------------------------------
  */

  const timelineItems = [
    ...breaks.map((item) => ({
      color: item.end ? 'green' : 'orange',

      dot: item.end ? <CoffeeOutlined /> : <PauseCircleOutlined />,

      children: (
        <div>
          <div className="font-medium text-slate-700">
            {item.end ? 'Break' : 'Break in Progress'}
          </div>

          <div className="text-sm text-slate-500">
            {formatTime(item.start)}

            {item.end ? ` - ${formatTime(item.end)}` : ''}
          </div>
        </div>
      ),
    })),

    ...(breaks.length === 0
      ? [
          {
            color: 'gray',

            children: <span className="text-slate-500">No breaks recorded for this session.</span>,
          },
        ]
      : []),
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
        <h1 className="text-3xl font-bold">Mark Attendance</h1>

        <p className="text-slate-500">Manage your breaks and track your working hours.</p>
      </div>

      {/* Session */}

      <Card className="rounded-xl">
        <div className="flex flex-col gap-6">
          {/* Session Header */}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm text-slate-500">Current Session</div>

              <div className="mt-1 text-2xl font-bold uppercase text-slate-800">
                {session || '--'}
              </div>
            </div>

            <Tag color={statusColor} className="w-fit">
              {currentSession?.currentStatus || 'Not Checked In'}
            </Tag>
          </div>

          {/* Session Information */}

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Check In */}

            <div>
              <div className="text-sm text-slate-500">Check In</div>

              <div className="mt-1 text-2xl font-bold text-slate-800">
                {formatTime(currentSession?.checkIn || null)}
              </div>
            </div>

            {/* Check Out */}

            <div>
              <div className="text-sm text-slate-500">Check Out</div>

              <div className="mt-1 text-2xl font-bold text-slate-800">
                {formatTime(currentSession?.checkOut || null)}
              </div>
            </div>

            {/* Working Time */}

            <div>
              <div className="text-sm text-slate-500">Working Time</div>

              <div className="mt-1 font-mono text-3xl font-bold text-green-600">{workingTime}</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Break Action */}

      <Card
        title={
          <div className="flex items-center gap-2">
            <CoffeeOutlined />
            <span>{session?.toUpperCase() || '--'} Session</span>
          </div>
        }
        className="rounded-xl"
      >
        {!currentSession ? (
          <Tag color="default">Attendance not available</Tag>
        ) : currentSession.currentStatus === 'On Break' ? (
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
        ) : currentSession.currentStatus === 'Working' ? (
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
          <Tag color="green">{session?.toUpperCase()} Session Completed</Tag>
        )}
      </Card>

      {/* Break History */}

      <Card
        title={
          <div className="flex items-center gap-2">
            <CoffeeOutlined />

            <span>{session?.toUpperCase() || '--'} Session Breaks</span>
          </div>
        }
        className="rounded-xl"
      >
        <Timeline items={timelineItems} />
      </Card>
    </div>
  );
}
