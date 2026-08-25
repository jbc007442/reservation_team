'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, Input, Select, Space, Table, Tag, Typography, message } from 'antd';
import { SearchOutlined, UserOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface User {
  _id: string;
  employeeId: string;
  name: string;
  email?: string;
  role: 'employee' | 'accountant';
}

export default function Role() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>();
  const [updatingId, setUpdatingId] = useState<string>();

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const response = await fetch('/api/admin/role');
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to fetch users');
      }

      setUsers(result.data || []);
    } catch (error: any) {
      message.error(error.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const value = search.toLowerCase();

      const matchesSearch =
        !value ||
        user.name.toLowerCase().includes(value) ||
        user.employeeId.toLowerCase().includes(value) ||
        user.email?.toLowerCase().includes(value);

      const matchesRole = !roleFilter || user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const updateRole = async (userId: string, role: 'employee' | 'accountant') => {
    try {
      setUpdatingId(userId);

      const response = await fetch('/api/admin/role', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          role,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to update role');
      }

      setUsers((current) =>
        current.map((user) => (user._id === userId ? { ...user, role } : user))
      );

      message.success('Role updated successfully');
    } catch (error: any) {
      message.error(error.message || 'Failed to update role');
    } finally {
      setUpdatingId(undefined);
    }
  };

  const columns = [
    {
      title: 'Employee',
      key: 'employee',
      render: (_: unknown, record: User) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <UserOutlined />
          </div>

          <div>
            <div className="font-medium text-gray-900">{record.name}</div>

            <div className="text-xs text-gray-500">{record.employeeId}</div>
          </div>
        </div>
      ),
    },

    {
      title: 'Email',
      dataIndex: 'email',
      render: (value: string) => value || '-',
    },

    {
      title: 'Current Role',
      dataIndex: 'role',
      width: 160,
      render: (role: User['role']) => (
        <Tag color={role === 'accountant' ? 'blue' : 'green'}>
          {role === 'accountant' ? 'Accountant' : 'Employee'}
        </Tag>
      ),
    },

    {
      title: 'Change Role',
      key: 'changeRole',
      width: 180,
      render: (_: unknown, record: User) => (
        <Select
          value={record.role}
          style={{ width: 150 }}
          loading={updatingId === record._id}
          disabled={updatingId === record._id}
          onChange={(role) => updateRole(record._id, role)}
          options={[
            {
              label: 'Employee',
              value: 'employee',
            },
            {
              label: 'Accountant',
              value: 'accountant',
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <Title level={3} style={{ margin: 0 }}>
          Assign Roles
        </Title>

        <Text type="secondary">Manage employee and accountant roles</Text>
      </div>

      {/* Main Card */}
      <Card
        bordered={false}
        className="overflow-hidden rounded-xl shadow-sm"
        styles={{ body: { padding: 0 } }}
      >
        {/* Toolbar */}
        <div className="border-b border-gray-200 bg-gray-50 px-5 py-4">
          <Space wrap size="middle" className="w-full">
            <Input
              allowClear
              prefix={<SearchOutlined />}
              placeholder="Search employee, ID or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 300 }}
            />

            <Select
              allowClear
              placeholder="Filter by role"
              value={roleFilter}
              onChange={setRoleFilter}
              style={{ width: 170 }}
              options={[
                {
                  label: 'Employee',
                  value: 'employee',
                },
                {
                  label: 'Accountant',
                  value: 'accountant',
                },
              ]}
            />

            <Text type="secondary">{filteredUsers.length} users</Text>
          </Space>
        </div>

        {/* Table Header */}
        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <div className="font-semibold text-gray-900">User Roles</div>

            <div className="mt-1 text-xs text-gray-500">Assign and manage user roles</div>
          </div>

          <Tag>{users.length} Total</Tag>
        </div>

        {/* Table */}
        <Table<User>
          rowKey="_id"
          loading={loading}
          dataSource={filteredUsers}
          columns={columns}
          scroll={{ x: 800 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} users`,
          }}
        />
      </Card>
    </div>
  );
}
