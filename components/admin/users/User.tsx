'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, Table, Typography, Input, Row, Col, Skeleton } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

import { userColumns } from './userColumns';

const { Title, Text } = Typography;

export default function User() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const res = await fetch('/api/users', {
        method: 'GET',
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch users');
      }

      setUsers(data.users || []);
    } catch (error) {
      console.error(error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) =>
      Object.values(user).join(' ').toLowerCase().includes(search.toLowerCase())
    );
  }, [users, search]);

  return (
    <Card
      bordered={false}
      style={{
        borderRadius: 12,
      }}
    >
      <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
        <Col>
          <Title level={4} style={{ margin: 0 }}>
            Users
          </Title>

          <Text type="secondary">Total Users: {filteredUsers.length}</Text>
        </Col>

        <Col>
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Search user..."
            style={{ width: 300 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Col>
      </Row>

      {loading ? (
        <div>
          <Skeleton.Input active block style={{ height: 32, marginBottom: 12 }} />
          <Skeleton.Input active block style={{ height: 32, marginBottom: 12 }} />
          <Skeleton.Input active block style={{ height: 32, marginBottom: 12 }} />
          <Skeleton.Input active block style={{ height: 32, marginBottom: 12 }} />
          <Skeleton.Input active block style={{ height: 32, marginBottom: 12 }} />
          <Skeleton.Input active block style={{ height: 32 }} />
        </div>
      ) : (
        <Table
          rowKey="_id"
          columns={userColumns}
          dataSource={filteredUsers}
          bordered
          size="middle"
          scroll={{ x: 1200 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} users`,
          }}
        />
      )}
    </Card>
  );
}