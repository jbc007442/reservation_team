'use client';

import { useState } from 'react';
import { Button, Card, Col, Input, Row, Select, Table, Tag, Tooltip, message, Space } from 'antd';

import { CheckOutlined, CloseOutlined, EyeOutlined } from '@ant-design/icons';

export default function LeaveManagementPage() {
  const [leaves, setLeaves] = useState([
    {
      key: '1',
      employee: 'Tarun Kumar',
      leaveType: 'Casual Leave',
      from: '12 Jul 2026',
      to: '13 Jul 2026',
      days: 2,
      reason: 'Personal Work',
      status: 'Pending',
    },
    {
      key: '2',
      employee: 'Rahul Sharma',
      leaveType: 'Sick Leave',
      from: '15 Jul 2026',
      to: '15 Jul 2026',
      days: 1,
      reason: 'Fever',
      status: 'Approved',
    },
    {
      key: '3',
      employee: 'Amit Singh',
      leaveType: 'Privilege Leave',
      from: '18 Jul 2026',
      to: '20 Jul 2026',
      days: 3,
      reason: 'Family Function',
      status: 'Rejected',
    },
  ]);

  const updateStatus = (key: string, status: string) => {
    setLeaves((prev) => prev.map((item) => (item.key === key ? { ...item, status } : item)));

    message.success(`Leave ${status.toLowerCase()} successfully.`);
  };

  const columns = [
    {
      title: 'Employee',
      dataIndex: 'employee',
      width: 180,
    },
    {
      title: 'Leave Type',
      dataIndex: 'leaveType',
      width: 180,
    },
    {
      title: 'From',
      dataIndex: 'from',
      width: 130,
    },
    {
      title: 'To',
      dataIndex: 'to',
      width: 130,
    },
    {
      title: 'Days',
      dataIndex: 'days',
      width: 80,
      align: 'center' as const,
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      width: 220,
      ellipsis: true,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 120,
      render: (status: string) => {
        const color = status === 'Approved' ? 'green' : status === 'Rejected' ? 'red' : 'orange';

        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: 'Action',
      width: 140,
      align: 'center' as const,
      render: (_: any, record: any) => (
        <Space size="small">
          <Tooltip title="View">
            <Button shape="circle" icon={<EyeOutlined />} />
          </Tooltip>

          {record.status === 'Pending' && (
            <>
              <Tooltip title="Approve">
                <Button
                  type="primary"
                  shape="circle"
                  icon={<CheckOutlined />}
                  onClick={() => updateStatus(record.key, 'Approved')}
                />
              </Tooltip>

              <Tooltip title="Reject">
                <Button
                  danger
                  shape="circle"
                  icon={<CloseOutlined />}
                  onClick={() => updateStatus(record.key, 'Rejected')}
                />
              </Tooltip>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Leave Management</h1>

        <p className="text-slate-500">Review and manage employee leave requests.</p>
      </div>

      {/* Filters */}
      <Card>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={24} md={12} lg={8}>
            <Input.Search placeholder="Search Employee..." allowClear />
          </Col>

          <Col xs={24} sm={24} md={12} lg={6}>
            <Select
              className="w-full"
              defaultValue="All"
              options={[
                {
                  label: 'All Status',
                  value: 'All',
                },
                {
                  label: 'Pending',
                  value: 'Pending',
                },
                {
                  label: 'Approved',
                  value: 'Approved',
                },
                {
                  label: 'Rejected',
                  value: 'Rejected',
                },
              ]}
            />
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card title="Leave Requests" className="overflow-hidden">
        <Table
          rowKey="key"
          columns={columns}
          dataSource={leaves}
          pagination={{
            pageSize: 10,
          }}
          scroll={{ x: 1200 }}
          size="middle"
        />
      </Card>
    </div>
  );
}
