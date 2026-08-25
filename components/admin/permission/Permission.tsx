'use client';

import { useEffect, useState } from 'react';
import { Button, Card, Input, Space, Table, Tag, Typography, message } from 'antd';
import { SafetyCertificateOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useRouter } from 'next/navigation';

const { Title, Text } = Typography;

interface User {
  _id: string;
  employeeId: string;
  name: string;
  email?: string;
  role: 'admin' | 'employee' | 'accountant';
  designation?: string;
  status: 'active' | 'inactive';
}

export default function Permission() {
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const response = await fetch('/api/admin/permissions');
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

  const filteredUsers = users.filter((user) => {
    const value = search.toLowerCase();

    return (
      user.name.toLowerCase().includes(value) ||
      user.employeeId.toLowerCase().includes(value) ||
      user.email?.toLowerCase().includes(value)
    );
  });

  const columns: ColumnsType<User> = [
    {
      title: 'Employee',
      key: 'employee',
      render: (_, record) => (
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
      render: (value) => value || '-',
    },

    {
      title: 'Role',
      dataIndex: 'role',
      render: (role) => (
        <Tag color={role === 'admin' ? 'red' : role === 'accountant' ? 'blue' : 'green'}>
          {role}
        </Tag>
      ),
    },

    {
      title: 'Status',
      dataIndex: 'status',
      render: (status) => <Tag color={status === 'active' ? 'green' : 'default'}>{status}</Tag>,
    },

    {
      title: 'Permissions',
      key: 'permissions',
      align: 'center',
      width: 170,
      render: (_, record) => (
        <Button
          type="primary"
          icon={<SafetyCertificateOutlined />}
          onClick={() => router.push(`/admin/permissions/${record._id}`)}
        >
          Manage
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <Title level={3} style={{ margin: 0 }}>
          User Permissions
        </Title>

        <Text type="secondary">Manage permissions for individual users</Text>
      </div>

      <Card
        bordered={false}
        className="overflow-hidden rounded-xl shadow-sm"
        styles={{ body: { padding: 0 } }}
      >
        <div className="border-b border-gray-200 bg-gray-50 px-5 py-4">
          <Space wrap>
            <Input
              allowClear
              prefix={<SearchOutlined />}
              placeholder="Search employee, ID or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 300 }}
            />

            <Text type="secondary">{filteredUsers.length} users</Text>
          </Space>
        </div>

        <div className="px-5 py-4">
          <div className="font-semibold text-gray-900">All Users</div>

          <div className="mt-1 text-xs text-gray-500">
            Select a user to manage their permissions
          </div>
        </div>

        <Table<User>
          rowKey="_id"
          loading={loading}
          dataSource={filteredUsers}
          columns={columns}
          scroll={{ x: 700 }}
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
