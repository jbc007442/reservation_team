'use client';

import { useMemo, useState } from 'react';
import { Card, Input, Table, Typography, Row, Col, Button, Space, Skeleton } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';

import { manageUserColumns } from './manageUserColumns';

const { Title, Text } = Typography;

interface Props {
  users?: any[];
  loading?: boolean;
  onDelete: (id: string) => void;
}

export default function ManageUsersTable({ users = [], loading = false, onDelete }: Props) {
  const [search, setSearch] = useState('');

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
      <Row justify="space-between" align="middle" gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col>
          <Title level={4} style={{ margin: 0 }}>
            Manage Users
          </Title>

          <Text type="secondary">Total Users: {filteredUsers.length}</Text>
        </Col>

        <Col>
          <Space>
            <Input
              allowClear
              prefix={<SearchOutlined />}
              placeholder="Search employee..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 280 }}
            />

            <Button type="primary" icon={<PlusOutlined />}>
              Add User
            </Button>
          </Space>
        </Col>
      </Row>

      {loading ? (
        <div>
          {/* Header Skeleton */}
          <Skeleton.Input
            active
            block
            style={{
              height: 32,
              marginBottom: 16,
            }}
          />

          {/* Table Row Skeletons */}
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton.Input
              key={index}
              active
              block
              style={{
                height: 32,
                marginBottom: 12,
              }}
            />
          ))}
        </div>
      ) : (
        <Table
          rowKey="_id"
          columns={manageUserColumns({ onDelete })}
          dataSource={filteredUsers}
          bordered
          size="middle"
          scroll={{ x: 1000 }}
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
