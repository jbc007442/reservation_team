'use client';

import { useEffect, useState } from 'react';
import { Avatar, Card, Col, Input, Row, Table } from 'antd';

import { SearchOutlined } from '@ant-design/icons';

import { useRouter } from 'next/navigation';

interface User {
  _id: string;
  name: string;
  email?: string;
  avatar?: string;
}

export default function Daily() {
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  // ------------------------------------------
  // Fetch Users
  // ------------------------------------------

  const fetchUsers = async () => {
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
        throw new Error(result.message || 'Failed to fetch users.');
      }

      setUsers(result.data || []);
    } catch (error) {
      console.error('Fetch Users Error:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------
  // Load Users
  // ------------------------------------------

  useEffect(() => {
    fetchUsers();
  }, [search]);

  // ------------------------------------------
  // Table Columns
  // ------------------------------------------

  const columns = [
    {
      title: 'Employee',
      key: 'employee',
      render: (_: unknown, record: User) => (
        <div className="flex items-center gap-3">
          <Avatar size={48} className="bg-[#0f172a] text-white">
            {record.name
              .trim()
              .split(/\s+/)
              .slice(0, 2)
              .map((word) => word.charAt(0))
              .join('')
              .toUpperCase()}
          </Avatar>

          <div>
            <div className="font-medium text-slate-800">{record.name}</div>

            {record.email && <div className="mt-1 text-sm text-slate-500">{record.email}</div>}
          </div>
        </div>
      ),
    },
  ];

  // ------------------------------------------
  // UI
  // ------------------------------------------

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Daily Attendance</h1>

        <p className="mt-1 text-slate-500">Select an employee to view attendance.</p>
      </div>

      {/* Search */}
      <Card className="rounded-xl">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={10} lg={8}>
            <Input
              size="large"
              allowClear
              prefix={<SearchOutlined className="text-slate-400" />}
              placeholder="Search employee..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Col>
        </Row>
      </Card>

      {/* Employees */}
      <Card
        title={<span className="text-lg font-semibold">Employees</span>}
        className="overflow-hidden rounded-xl"
      >
        <Table<User>
          rowKey="_id"
          columns={columns}
          dataSource={users}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['10', '25', '50', '100'],
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} employees`,
          }}
          onRow={(record) => ({
            onClick: () => {
              router.push(`/admin/attendance/daily/${record._id}`);
            },
            style: {
              cursor: 'pointer',
            },
          })}
        />
      </Card>
    </div>
  );
}
