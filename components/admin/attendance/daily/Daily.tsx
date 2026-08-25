// 'use client';

// import { useEffect, useState } from 'react';
// import { Button, Card, Col, Input, Row, Table, Tag } from 'antd';
// import { DownloadOutlined, SearchOutlined } from '@ant-design/icons';
// import dayjs from 'dayjs';

// interface Employee {
//   _id: string;
//   employeeId?: string;
//   name: string;
// }

// interface AttendanceRecord {
//   _id: string;
//   employee: Employee;
//   date: string;
//   checkIn: string | null;
//   checkOut: string | null;
//   currentStatus: 'Working' | 'On Break' | 'Checked Out';
//   workingMinutes: number;
//   breakMinutes: number;
//   status: 'Present' | 'Absent' | 'Half Day' | 'Leave' | 'Holiday' | 'Weekly Off';
// }

// export default function Daily() {
//   const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
//   const [loading, setLoading] = useState(false);

//   const [search, setSearch] = useState('');

//   const fetchAttendance = async () => {
//     try {
//       setLoading(true);

//       const params = new URLSearchParams();

//       if (search.trim()) {
//         params.set('search', search.trim());
//       }

//       const response = await fetch(`/api/admin/attendance/daily?${params.toString()}`, {
//         cache: 'no-store',
//       });

//       const result = await response.json();

//       if (!response.ok || !result.success) {
//         throw new Error(result.message || 'Failed to fetch attendance.');
//       }

//       setAttendance(result.data || []);
//     } catch (error) {
//       console.error('Attendance fetch error:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchAttendance();
//   }, [search]);

//   const formatTime = (value: string | null) => {
//     if (!value) {
//       return '--';
//     }

//     return dayjs(value).format('hh:mm A');
//   };

//   const formatWorkingTime = (minutes: number) => {
//     if (!minutes) {
//       return '00h 00m';
//     }

//     const hours = Math.floor(minutes / 60);
//     const mins = minutes % 60;

//     return `${String(hours).padStart(2, '0')}h ${String(mins).padStart(2, '0')}m`;
//   };

//   const getCurrentStatusColor = (status: AttendanceRecord['currentStatus']) => {
//     switch (status) {
//       case 'Working':
//         return 'blue';

//       case 'On Break':
//         return 'orange';

//       case 'Checked Out':
//         return 'green';

//       default:
//         return 'default';
//     }
//   };

//   const getStatusColor = (status: AttendanceRecord['status']) => {
//     switch (status) {
//       case 'Present':
//         return 'green';

//       case 'Absent':
//         return 'red';

//       case 'Half Day':
//         return 'orange';

//       case 'Leave':
//         return 'purple';

//       case 'Holiday':
//         return 'cyan';

//       case 'Weekly Off':
//         return 'default';

//       default:
//         return 'default';
//     }
//   };

//   const columns = [
//     {
//       title: 'Employee ID',
//       key: 'employeeId',
//       width: 140,
//       render: (_: unknown, record: AttendanceRecord) => record.employee?.employeeId || '--',
//     },

//     {
//       title: 'Employee',
//       key: 'employee',
//       width: 200,
//       render: (_: unknown, record: AttendanceRecord) => (
//         <span className="font-medium text-slate-700">{record.employee?.name || '--'}</span>
//       ),
//     },

//     {
//       title: 'Check In',
//       key: 'checkIn',
//       width: 130,
//       render: (_: unknown, record: AttendanceRecord) => formatTime(record.checkIn),
//     },

//     {
//       title: 'Check Out',
//       key: 'checkOut',
//       width: 130,
//       render: (_: unknown, record: AttendanceRecord) => formatTime(record.checkOut),
//     },

//     {
//       title: 'Working Hours',
//       key: 'workingMinutes',
//       width: 150,
//       render: (_: unknown, record: AttendanceRecord) => formatWorkingTime(record.workingMinutes),
//     },

//     {
//       title: 'Break',
//       key: 'breakMinutes',
//       width: 120,
//       render: (_: unknown, record: AttendanceRecord) => formatWorkingTime(record.breakMinutes),
//     },

//     {
//       title: 'Current Status',
//       key: 'currentStatus',
//       width: 150,
//       render: (_: unknown, record: AttendanceRecord) => (
//         <Tag color={getCurrentStatusColor(record.currentStatus)}>{record.currentStatus}</Tag>
//       ),
//     },
//   ];

//   return (
//     <div className="flex flex-col gap-6">
//       {/* Header */}
//       <div className="flex flex-wrap items-center justify-between gap-4">
//         <div>
//           <h1 className="text-3xl font-bold text-slate-900">Daily Attendance</h1>

//           <p className="mt-1 text-slate-500">Monitor today's employee attendance.</p>
//         </div>

//         <Button type="primary" icon={<DownloadOutlined />}>
//           Export
//         </Button>
//       </div>

//       {/* Filters */}
//       <Card className="rounded-xl">
//         <Row gutter={[16, 16]}>
//           <Col xs={24} md={10} lg={8}>
//             <Input
//               size="large"
//               allowClear
//               prefix={<SearchOutlined className="text-slate-400" />}
//               placeholder="Search employee or ID..."
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//             />
//           </Col>
//         </Row>
//       </Card>

//       {/* Table */}
//       <Card
//         title={<span className="text-lg font-semibold">Today's Attendance</span>}
//         className="overflow-hidden rounded-xl"
//       >
//         <Table
//           rowKey="_id"
//           columns={columns}
//           dataSource={attendance}
//           loading={loading}
//           pagination={{
//             pageSize: 10,
//             showSizeChanger: true,
//           }}
//           scroll={{ x: 1250 }}
//         />
//       </Card>
//     </div>
//   );
// }

'use client';

import { useEffect, useState } from 'react';
import { Button, Card, Col, Input, Row, Table, Tag } from 'antd';
import { DownloadOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

interface Employee {
  _id: string;
  employeeId?: string;
  name: string;
  email?: string;
}

interface Session {
  checkIn: string | null;
  checkOut: string | null;
  currentStatus: 'Working' | 'On Break' | 'Checked Out';
  lastActivityAt: string | null;
  workingMinutes: number;
  breakMinutes: number;
  autoLogoutAt?: string | null;
}

interface AttendanceRecord {
  _id: string;

  employee: Employee;

  date: string;

  am: Session;

  pm: Session;

  status: 'Present' | 'Absent' | 'Half Day' | 'Leave' | 'Holiday' | 'Weekly Off';

  createdAt?: string;

  updatedAt?: string;
}

export default function Daily() {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);

  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState('');

  /*
  |--------------------------------------------------------------------------
  | Fetch Attendance
  |--------------------------------------------------------------------------
  */

  const fetchAttendance = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      if (search.trim()) {
        params.set('search', search.trim());
      }

      const response = await fetch(`/api/admin/attendance/daily?${params.toString()}`, {
        cache: 'no-store',
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to fetch attendance.');
      }

      setAttendance(result.data || []);
    } catch (error) {
      console.error('Attendance fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Initial / Search Load
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    fetchAttendance();
  }, [search]);

  /*
  |--------------------------------------------------------------------------
  | Format Time
  |--------------------------------------------------------------------------
  */

  const formatTime = (value: string | null) => {
    if (!value) {
      return '--';
    }

    return dayjs(value).format('hh:mm A');
  };

  /*
  |--------------------------------------------------------------------------
  | Format Working Time
  |--------------------------------------------------------------------------
  */

  const formatWorkingTime = (minutes: number) => {
    if (!minutes) {
      return '00h 00m';
    }

    const hours = Math.floor(minutes / 60);

    const mins = minutes % 60;

    return `${String(hours).padStart(2, '0')}h ${String(mins).padStart(2, '0')}m`;
  };

  /*
  |--------------------------------------------------------------------------
  | Session Status Color
  |--------------------------------------------------------------------------
  */

  const getCurrentStatusColor = (status: Session['currentStatus']) => {
    switch (status) {
      case 'Working':
        return 'blue';

      case 'On Break':
        return 'orange';

      case 'Checked Out':
        return 'green';

      default:
        return 'default';
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Attendance Status Color
  |--------------------------------------------------------------------------
  */

  const getStatusColor = (status: AttendanceRecord['status']) => {
    switch (status) {
      case 'Present':
        return 'green';

      case 'Absent':
        return 'red';

      case 'Half Day':
        return 'orange';

      case 'Leave':
        return 'purple';

      case 'Holiday':
        return 'cyan';

      case 'Weekly Off':
        return 'default';

      default:
        return 'default';
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Session Status
  |--------------------------------------------------------------------------
  */

  const renderSessionStatus = (session: Session) => {
    return <Tag color={getCurrentStatusColor(session.currentStatus)}>{session.currentStatus}</Tag>;
  };

  /*
  |--------------------------------------------------------------------------
  | Table Columns
  |--------------------------------------------------------------------------
  */

  const columns = [
    {
      title: 'Employee ID',
      key: 'employeeId',
      width: 130,

      render: (_: unknown, record: AttendanceRecord) => record.employee?.employeeId || '--',
    },

    {
      title: 'Employee',
      key: 'employee',
      width: 200,

      render: (_: unknown, record: AttendanceRecord) => (
        <span className="font-medium text-slate-700">{record.employee?.name || '--'}</span>
      ),
    },

    /*
    |--------------------------------------------------------------------------
    | AM
    |--------------------------------------------------------------------------
    */

    {
      title: 'AM',
      children: [
        {
          title: 'Check In',
          key: 'amCheckIn',
          width: 120,

          render: (_: unknown, record: AttendanceRecord) => formatTime(record.am?.checkIn),
        },

        {
          title: 'Check Out',
          key: 'amCheckOut',
          width: 120,

          render: (_: unknown, record: AttendanceRecord) => formatTime(record.am?.checkOut),
        },

        {
          title: 'Hours',
          key: 'amWorking',
          width: 110,

          render: (_: unknown, record: AttendanceRecord) =>
            formatWorkingTime(record.am?.workingMinutes || 0),
        },

        {
          title: 'Break',
          key: 'amBreak',
          width: 110,

          render: (_: unknown, record: AttendanceRecord) =>
            formatWorkingTime(record.am?.breakMinutes || 0),
        },

        {
          title: 'Status',
          key: 'amStatus',
          width: 130,

          render: (_: unknown, record: AttendanceRecord) => renderSessionStatus(record.am),
        },
      ],
    },

    /*
    |--------------------------------------------------------------------------
    | PM
    |--------------------------------------------------------------------------
    */

    {
      title: 'PM',
      children: [
        {
          title: 'Check In',
          key: 'pmCheckIn',
          width: 120,

          render: (_: unknown, record: AttendanceRecord) => formatTime(record.pm?.checkIn),
        },

        {
          title: 'Check Out',
          key: 'pmCheckOut',
          width: 120,

          render: (_: unknown, record: AttendanceRecord) => formatTime(record.pm?.checkOut),
        },

        {
          title: 'Hours',
          key: 'pmWorking',
          width: 110,

          render: (_: unknown, record: AttendanceRecord) =>
            formatWorkingTime(record.pm?.workingMinutes || 0),
        },

        {
          title: 'Break',
          key: 'pmBreak',
          width: 110,

          render: (_: unknown, record: AttendanceRecord) =>
            formatWorkingTime(record.pm?.breakMinutes || 0),
        },

        {
          title: 'Status',
          key: 'pmStatus',
          width: 130,

          render: (_: unknown, record: AttendanceRecord) => renderSessionStatus(record.pm),
        },
      ],
    },

    /*
    |--------------------------------------------------------------------------
    | Overall Status
    |--------------------------------------------------------------------------
    */

    {
      title: 'Attendance',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      align: 'center' as const,

      render: (status: AttendanceRecord['status']) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      ),
    },
  ];

  /*
  |--------------------------------------------------------------------------
  | UI
  |--------------------------------------------------------------------------
  */

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Daily Attendance</h1>

          <p className="mt-1 text-slate-500">Monitor employee AM and PM attendance.</p>
        </div>

        <Button type="primary" icon={<DownloadOutlined />}>
          Export
        </Button>
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
        </Row>
      </Card>

      {/* Table */}

      <Card
        title={<span className="text-lg font-semibold">Today's Attendance</span>}
        className="overflow-hidden rounded-xl"
      >
        <Table<AttendanceRecord>
          rowKey="_id"
          columns={columns}
          dataSource={attendance}
          loading={loading}
          bordered
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['10', '25', '50', '100'],
          }}
          scroll={{
            x: 1800,
          }}
        />
      </Card>
    </div>
  );
}