'use client';

import { useEffect, useState } from 'react';

import {
  Button,
  Card,
  Col,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  message,
} from 'antd';

import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';

import { CheckOutlined, CloseOutlined, EyeOutlined, SearchOutlined } from '@ant-design/icons';

import dayjs from 'dayjs';

/*
|--------------------------------------------------------------------------
| Types
|--------------------------------------------------------------------------
*/

type LeaveType = 'CL' | 'SL' | 'PL' | 'LOP';

type LeaveStatus = 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';

interface Employee {
  _id: string;
  employeeId?: string;
  name: string;
  email?: string;
  department?: string;
  designation?: string;
}

interface ApprovedBy {
  _id: string;
  name: string;
  email?: string;
  employeeId?: string;
}

interface LeaveRecord {
  _id: string;

  employee: Employee;

  leaveType: LeaveType;

  fromDate: string;

  toDate: string;

  totalDays: number;

  reason: string;

  status: LeaveStatus;

  rejectionReason?: string;

  remarks?: string;

  attachment?: string;

  approvedAt?: string | null;

  approvedBy?: ApprovedBy | null;

  createdAt: string;
}

interface ApiResponse {
  success: boolean;
  message?: string;
  data: LeaveRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/*
|--------------------------------------------------------------------------
| Leave Types
|--------------------------------------------------------------------------
*/

const LEAVE_TYPES: {
  value: LeaveType;
  label: string;
}[] = [
  {
    value: 'CL',
    label: 'Casual Leave',
  },
  {
    value: 'SL',
    label: 'Sick Leave',
  },
  {
    value: 'PL',
    label: 'Privilege Leave',
  },
  {
    value: 'LOP',
    label: 'Leave Without Pay',
  },
];

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

const getLeaveTypeLabel = (type?: LeaveType) => {
  switch (type) {
    case 'CL':
      return 'Casual Leave';

    case 'SL':
      return 'Sick Leave';

    case 'PL':
      return 'Privilege Leave';

    case 'LOP':
      return 'Leave Without Pay';

    default:
      return '-';
  }
};

const getLeaveTypeColor = (type?: LeaveType) => {
  switch (type) {
    case 'CL':
      return 'blue';

    case 'SL':
      return 'red';

    case 'PL':
      return 'purple';

    case 'LOP':
      return 'orange';

    default:
      return 'default';
  }
};

const getStatusColor = (status: LeaveStatus) => {
  switch (status) {
    case 'Approved':
      return 'green';

    case 'Rejected':
      return 'red';

    case 'Cancelled':
      return 'default';

    case 'Pending':
    default:
      return 'orange';
  }
};

/*
|--------------------------------------------------------------------------
| Component
|--------------------------------------------------------------------------
*/

export default function Leaves() {
  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);

  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState('');

  const [status, setStatus] = useState<LeaveStatus | 'All'>('All');

  const [leaveType, setLeaveType] = useState<LeaveType | 'All'>('All');

  const [page, setPage] = useState(1);

  const [pageSize, setPageSize] = useState(10);

  const [total, setTotal] = useState(0);

  const [viewModalOpen, setViewModalOpen] = useState(false);

  const [rejectModalOpen, setRejectModalOpen] = useState(false);

  const [selectedLeave, setSelectedLeave] = useState<LeaveRecord | null>(null);

  const [rejectionReason, setRejectionReason] = useState('');

  const [actionLoading, setActionLoading] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | Fetch Leaves
  |--------------------------------------------------------------------------
  */

  const fetchLeaves = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      params.set('page', String(page));

      params.set('limit', String(pageSize));

      if (search.trim()) {
        params.set('search', search.trim());
      }

      if (status !== 'All') {
        params.set('status', status);
      }

      if (leaveType !== 'All') {
        params.set('leaveType', leaveType);
      }

      const response = await fetch(`/api/admin/attendance/leaves?${params.toString()}`, {
        method: 'GET',
        cache: 'no-store',
      });

      const result: ApiResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to fetch leave requests.');
      }

      setLeaves(result.data || []);

      setTotal(result.total || 0);
    } catch (error) {
      console.error('Leave fetch error:', error);

      message.error(error instanceof Error ? error.message : 'Failed to fetch leave requests.');

      setLeaves([]);

      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Fetch whenever filters/pagination change
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    fetchLeaves();
  }, [page, pageSize, status, leaveType, search]);

  /*
  |--------------------------------------------------------------------------
  | Search
  |--------------------------------------------------------------------------
  */

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  /*
  |--------------------------------------------------------------------------
  | Status
  |--------------------------------------------------------------------------
  */

  const handleStatusChange = (value: LeaveStatus | 'All') => {
    setStatus(value);
    setPage(1);
  };

  /*
  |--------------------------------------------------------------------------
  | Leave Type
  |--------------------------------------------------------------------------
  */

  const handleLeaveTypeChange = (value: LeaveType | 'All') => {
    setLeaveType(value);
    setPage(1);
  };

  /*
  |--------------------------------------------------------------------------
  | View
  |--------------------------------------------------------------------------
  */

  const handleView = (record: LeaveRecord) => {
    setSelectedLeave(record);
    setViewModalOpen(true);
  };

  /*
  |--------------------------------------------------------------------------
  | Reject Modal
  |--------------------------------------------------------------------------
  */

  const handleRejectOpen = (record: LeaveRecord) => {
    setSelectedLeave(record);

    setRejectionReason('');

    setRejectModalOpen(true);
  };

  /*
  |--------------------------------------------------------------------------
  | Approve
  |--------------------------------------------------------------------------
  */

  const handleApprove = async (leaveId: string) => {
    try {
      setActionLoading(true);

      const response = await fetch('/api/admin/attendance/leaves', {
        method: 'PUT',

        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({
          leaveId,
          status: 'Approved',
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to approve leave.');
      }

      message.success('Leave approved successfully.');

      /*
       * Update the row immediately
       */
      setLeaves((prev) =>
        prev.map((item) =>
          item._id === leaveId
            ? {
                ...item,
                status: 'Approved',
                approvedBy: result.data?.approvedBy || null,
                approvedAt: result.data?.approvedAt || null,
              }
            : item
        )
      );

      /*
       * Update selected leave if modal is open
       */
      if (selectedLeave?._id === leaveId) {
        setSelectedLeave(result.data);
      }

      await fetchLeaves();
    } catch (error) {
      console.error('Approve leave error:', error);

      message.error(error instanceof Error ? error.message : 'Failed to approve leave.');
    } finally {
      setActionLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Reject
  |--------------------------------------------------------------------------
  */

  const handleReject = async () => {
    if (!selectedLeave) {
      return;
    }

    const reason = rejectionReason.trim();

    if (!reason) {
      message.warning('Rejection reason is required.');
      return;
    }

    try {
      setActionLoading(true);

      const response = await fetch('/api/admin/attendance/leaves', {
        method: 'PUT',

        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({
          leaveId: selectedLeave._id,
          status: 'Rejected',
          rejectionReason: reason,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to reject leave.');
      }

      message.success('Leave rejected successfully.');

      setRejectModalOpen(false);

      setViewModalOpen(false);

      setSelectedLeave(null);

      setRejectionReason('');

      await fetchLeaves();
    } catch (error) {
      console.error('Reject leave error:', error);

      message.error(error instanceof Error ? error.message : 'Failed to reject leave.');
    } finally {
      setActionLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Table Columns
  |--------------------------------------------------------------------------
  */

  const columns: ColumnsType<LeaveRecord> = [
    {
      title: 'Employee',

      key: 'employee',

      width: 190,

      render: (_, record) => (
        <div>
          <div className="font-medium text-slate-700">{record.employee?.name || '-'}</div>

          {record.employee?.employeeId && (
            <div className="text-xs text-slate-400">{record.employee.employeeId}</div>
          )}
        </div>
      ),
    },

    {
      title: 'Leave Type',

      key: 'leaveType',

      width: 180,

      render: (_, record) => (
        <div className="flex items-center gap-2">
          <Tag color={getLeaveTypeColor(record.leaveType)} className="m-0">
            {record.leaveType}
          </Tag>

          <span className="font-medium text-slate-700">{getLeaveTypeLabel(record.leaveType)}</span>
        </div>
      ),
    },

    {
      title: 'From',

      key: 'fromDate',

      width: 130,

      render: (_, record) => dayjs(record.fromDate).format('DD MMM YYYY'),
    },

    {
      title: 'To',

      key: 'toDate',

      width: 130,

      render: (_, record) => dayjs(record.toDate).format('DD MMM YYYY'),
    },

    {
      title: 'Days',

      dataIndex: 'totalDays',

      key: 'totalDays',

      width: 80,

      align: 'center',
    },

    {
      title: 'Reason',

      dataIndex: 'reason',

      key: 'reason',

      width: 220,

      ellipsis: true,
    },

    {
      title: 'Status',

      dataIndex: 'status',

      key: 'status',

      width: 120,

      render: (value: LeaveStatus) => <Tag color={getStatusColor(value)}>{value}</Tag>,
    },

    {
      title: 'Action',

      key: 'action',

      width: 150,

      fixed: 'right',

      align: 'center',

      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View">
            <Button shape="circle" icon={<EyeOutlined />} onClick={() => handleView(record)} />
          </Tooltip>

          {record.status === 'Pending' && (
            <>
              <Tooltip title="Approve">
                <Button
                  type="primary"
                  shape="circle"
                  icon={<CheckOutlined />}
                  loading={actionLoading}
                  onClick={() => handleApprove(record._id)}
                />
              </Tooltip>

              <Tooltip title="Reject">
                <Button
                  danger
                  shape="circle"
                  icon={<CloseOutlined />}
                  loading={actionLoading}
                  onClick={() => handleRejectOpen(record)}
                />
              </Tooltip>
            </>
          )}
        </Space>
      ),
    },
  ];

  /*
  |--------------------------------------------------------------------------
  | Pagination
  |--------------------------------------------------------------------------
  */

  const handleTableChange = (pagination: TablePaginationConfig) => {
    setPage(pagination.current || 1);

    setPageSize(pagination.pageSize || 10);
  };

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}

      <div>
        <h1 className="text-3xl font-bold text-slate-900">Leave Management</h1>

        <p className="mt-1 text-slate-500">Review and manage employee leave requests.</p>
      </div>

      {/* Filters */}

      <Card className="rounded-xl">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={24} md={12} lg={9}>
            <Input
              allowClear
              value={search}
              prefix={<SearchOutlined className="text-slate-400" />}
              placeholder="Search employee, ID or email..."
              onChange={(event) => handleSearch(event.target.value)}
              size="large"
            />
          </Col>

          <Col xs={24} sm={12} md={6} lg={5}>
            <Select
              size="large"
              className="w-full"
              value={status}
              onChange={handleStatusChange}
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
                {
                  label: 'Cancelled',
                  value: 'Cancelled',
                },
              ]}
            />
          </Col>

          <Col xs={24} sm={12} md={6} lg={5}>
            <Select
              size="large"
              className="w-full"
              value={leaveType}
              onChange={handleLeaveTypeChange}
              options={[
                {
                  label: 'All Leave Types',
                  value: 'All',
                },

                ...LEAVE_TYPES.map((type) => ({
                  label: type.label,
                  value: type.value,
                })),
              ]}
            />
          </Col>
        </Row>
      </Card>

      {/* Table */}

      <Card
        title={<div className="text-lg font-semibold">Leave Requests</div>}
        className="overflow-hidden rounded-xl"
      >
        <Table<LeaveRecord>
          rowKey="_id"
          columns={columns}
          dataSource={leaves}
          loading={loading}
          onChange={handleTableChange}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            showTotal: (value, range) => `${range[0]}-${range[1]} of ${value} leaves`,
          }}
          scroll={{ x: 1250 }}
          size="middle"
        />
      </Card>

      {/* View Modal */}

      <Modal
        title="Leave Request Details"
        open={viewModalOpen}
        onCancel={() => {
          setViewModalOpen(false);
          setSelectedLeave(null);
        }}
        footer={null}
        width={620}
      >
        {selectedLeave && (
          <div className="mt-5 space-y-5">
            {/* Employee */}

            <div className="rounded-xl bg-slate-50 p-4">
              <div className="text-xs text-slate-400">Employee</div>

              <div className="mt-1 text-lg font-semibold text-slate-800">
                {selectedLeave.employee?.name || '-'}
              </div>

              {selectedLeave.employee?.employeeId && (
                <div className="text-sm text-slate-500">{selectedLeave.employee.employeeId}</div>
              )}
            </div>

            <Row gutter={[24, 20]}>
              <Col xs={24} sm={12}>
                <div className="text-xs text-slate-400">Leave Type</div>

                <div className="mt-1 flex items-center gap-2">
                  <Tag color={getLeaveTypeColor(selectedLeave.leaveType)}>
                    {selectedLeave.leaveType}
                  </Tag>

                  <span className="font-medium text-slate-700">
                    {getLeaveTypeLabel(selectedLeave.leaveType)}
                  </span>
                </div>
              </Col>

              <Col xs={24} sm={12}>
                <div className="text-xs text-slate-400">Status</div>

                <div className="mt-1">
                  <Tag color={getStatusColor(selectedLeave.status)}>{selectedLeave.status}</Tag>
                </div>
              </Col>

              <Col xs={24} sm={12}>
                <div className="text-xs text-slate-400">From</div>

                <div className="mt-1 font-medium">
                  {dayjs(selectedLeave.fromDate).format('DD MMM YYYY')}
                </div>
              </Col>

              <Col xs={24} sm={12}>
                <div className="text-xs text-slate-400">To</div>

                <div className="mt-1 font-medium">
                  {dayjs(selectedLeave.toDate).format('DD MMM YYYY')}
                </div>
              </Col>

              <Col xs={24} sm={12}>
                <div className="text-xs text-slate-400">Total Days</div>

                <div className="mt-1 font-medium">{selectedLeave.totalDays}</div>
              </Col>

              <Col xs={24} sm={12}>
                <div className="text-xs text-slate-400">Applied On</div>

                <div className="mt-1 font-medium">
                  {dayjs(selectedLeave.createdAt).format('DD MMM YYYY, hh:mm A')}
                </div>
              </Col>
            </Row>

            {/* Reason */}

            <div>
              <div className="text-xs text-slate-400">Reason</div>

              <div className="mt-1 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                {selectedLeave.reason || '-'}
              </div>
            </div>

            {/* Rejection Reason */}

            {selectedLeave.status === 'Rejected' && selectedLeave.rejectionReason && (
              <div>
                <div className="text-xs text-slate-400">Rejection Reason</div>

                <div className="mt-1 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                  {selectedLeave.rejectionReason}
                </div>
              </div>
            )}

            {/* Approved */}

            {selectedLeave.status === 'Approved' && (
              <div className="rounded-lg bg-green-50 p-4">
                <div className="text-xs text-green-600">Approved</div>

                {selectedLeave.approvedBy && (
                  <div className="mt-1 font-medium text-green-800">
                    Approved by {selectedLeave.approvedBy.name}
                  </div>
                )}

                {selectedLeave.approvedAt && (
                  <div className="mt-1 text-xs text-green-600">
                    {dayjs(selectedLeave.approvedAt).format('DD MMM YYYY, hh:mm A')}
                  </div>
                )}
              </div>
            )}

            {/* Actions */}

            {selectedLeave.status === 'Pending' && (
              <div className="flex justify-end gap-3 border-t pt-4">
                <Button
                  danger
                  icon={<CloseOutlined />}
                  loading={actionLoading}
                  onClick={() => handleRejectOpen(selectedLeave)}
                >
                  Reject
                </Button>

                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  loading={actionLoading}
                  onClick={() => handleApprove(selectedLeave._id)}
                >
                  Approve
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Reject Modal */}

      <Modal
        title="Reject Leave Request"
        open={rejectModalOpen}
        onCancel={() => {
          if (!actionLoading) {
            setRejectModalOpen(false);
            setRejectionReason('');
          }
        }}
        onOk={handleReject}
        okText="Reject Leave"
        okButtonProps={{
          danger: true,
          loading: actionLoading,
        }}
        cancelButtonProps={{
          disabled: actionLoading,
        }}
      >
        {selectedLeave && (
          <div className="space-y-4">
            <div className="rounded-lg bg-slate-50 p-3">
              <div className="text-xs text-slate-400">Employee</div>

              <div className="font-medium text-slate-800">{selectedLeave.employee?.name}</div>

              <div className="mt-1 text-sm text-slate-500">
                {getLeaveTypeLabel(selectedLeave.leaveType)}
              </div>
            </div>

            <div>
              <div className="mb-2 font-medium text-slate-700">Rejection Reason</div>

              <Input.TextArea
                value={rejectionReason}
                onChange={(event) => setRejectionReason(event.target.value)}
                placeholder="Enter reason for rejecting this leave..."
                rows={4}
                maxLength={500}
                showCount
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
