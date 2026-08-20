'use client';

import { useEffect, useState } from 'react';
import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  message,
} from 'antd';

import type { ColumnsType } from 'antd/es/table';

import dayjs, { Dayjs } from 'dayjs';

import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
  SendOutlined,
} from '@ant-design/icons';

const { RangePicker } = DatePicker;
const { TextArea } = Input;

/*
|--------------------------------------------------------------------------
| API
|--------------------------------------------------------------------------
*/

const LEAVE_API = '/api/admin/attendance/leaves';

/*
|--------------------------------------------------------------------------
| Fixed Leave Types
|--------------------------------------------------------------------------
*/

const LEAVE_TYPES = [
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
| Types
|--------------------------------------------------------------------------
*/

type LeaveType = 'CL' | 'SL' | 'PL' | 'LOP';

type LeaveStatus = 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';

interface LeaveRecord {
  _id: string;

  leaveType: LeaveType;

  fromDate: string;

  toDate: string;

  totalDays: number;

  reason: string;

  status: LeaveStatus;

  rejectionReason?: string;

  remarks?: string;

  attachment?: string;

  createdAt: string;

  updatedAt?: string;
}

interface LeaveFormValues {
  leaveType: LeaveType;

  dates: [Dayjs, Dayjs];

  reason: string;
}

interface LeaveApiResponse {
  success: boolean;

  message?: string;

  data?: LeaveRecord[];

  total?: number;

  page?: number;

  limit?: number;

  totalPages?: number;
}

/*
|--------------------------------------------------------------------------
| Leave Type Helpers
|--------------------------------------------------------------------------
*/

const getLeaveTypeLabel = (type: LeaveType) => {
  const leave = LEAVE_TYPES.find((item) => item.value === type);

  return leave?.label || type;
};

const getLeaveTypeColor = (type: LeaveType) => {
  switch (type) {
    case 'CL':
      return 'blue';

    case 'SL':
      return 'red';

    case 'PL':
      return 'green';

    case 'LOP':
      return 'orange';

    default:
      return 'default';
  }
};

/*
|--------------------------------------------------------------------------
| Component
|--------------------------------------------------------------------------
*/

export default function Leave() {
  const [form] = Form.useForm<LeaveFormValues>();

  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);

  const [loading, setLoading] = useState(false);

  const [fetchLoading, setFetchLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);

  const [editingRecord, setEditingRecord] = useState<LeaveRecord | null>(null);

  const [search, setSearch] = useState('');

  /*
  |--------------------------------------------------------------------------
  | Fetch My Leaves
  |--------------------------------------------------------------------------
  */

  const fetchLeaves = async () => {
    try {
      setFetchLoading(true);

      const params = new URLSearchParams();

      params.set('page', '1');

      params.set('limit', '100');

      const response = await fetch(`${LEAVE_API}?${params.toString()}`, {
        method: 'GET',
        cache: 'no-store',
      });

      const result: LeaveApiResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to fetch leave history.');
      }

      setLeaves(result.data || []);
    } catch (error) {
      console.error('Leave fetch error:', error);

      message.error(error instanceof Error ? error.message : 'Failed to fetch leave history.');

      setLeaves([]);
    } finally {
      setFetchLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Initial Load
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    fetchLeaves();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Add Leave
  |--------------------------------------------------------------------------
  */

  const handleAdd = () => {
    setEditingRecord(null);

    form.resetFields();

    setModalOpen(true);
  };

  /*
  |--------------------------------------------------------------------------
  | Edit Leave
  |--------------------------------------------------------------------------
  */

  const handleEdit = (record: LeaveRecord) => {
    if (record.status !== 'Pending') {
      message.warning('Only pending leave requests can be edited.');

      return;
    }

    setEditingRecord(record);

    form.setFieldsValue({
      leaveType: record.leaveType,

      dates: [dayjs(record.fromDate), dayjs(record.toDate)],

      reason: record.reason,
    });

    setModalOpen(true);
  };

  /*
  |--------------------------------------------------------------------------
  | Delete / Cancel Leave
  |--------------------------------------------------------------------------
  */

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);

      const response = await fetch(`${LEAVE_API}?leaveId=${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to cancel leave request.');
      }

      message.success('Leave request cancelled successfully.');

      await fetchLeaves();
    } catch (error) {
      console.error('Delete leave error:', error);

      message.error(error instanceof Error ? error.message : 'Failed to cancel leave request.');
    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Submit / Update Leave
  |--------------------------------------------------------------------------
  */

  const onFinish = async (values: LeaveFormValues) => {
    try {
      setLoading(true);

      const [from, to] = values.dates;

      const fromDate = from.startOf('day');

      const toDate = to.startOf('day');

      const totalDays = toDate.diff(fromDate, 'day') + 1;

      if (totalDays <= 0) {
        message.error('Invalid leave duration.');

        return;
      }

      const payload = {
        leaveType: values.leaveType,

        fromDate: fromDate.format('YYYY-MM-DD'),

        toDate: toDate.format('YYYY-MM-DD'),

        totalDays,

        reason: values.reason.trim(),
      };

      /*
      |--------------------------------------------------------------------------
      | Update
      |--------------------------------------------------------------------------
      */

      if (editingRecord) {
        const response = await fetch(LEAVE_API, {
          method: 'PUT',

          headers: {
            'Content-Type': 'application/json',
          },

          body: JSON.stringify({
            leaveId: editingRecord._id,
            ...payload,
          }),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || 'Failed to update leave request.');
        }

        message.success('Leave request updated successfully.');
      } else {
        /*
      |--------------------------------------------------------------------------
      | Add
      |--------------------------------------------------------------------------
      */
        const response = await fetch(LEAVE_API, {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
          },

          body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || 'Failed to submit leave request.');
        }

        message.success('Leave request submitted successfully.');
      }

      form.resetFields();

      setModalOpen(false);

      setEditingRecord(null);

      await fetchLeaves();
    } catch (error) {
      console.error('Leave save error:', error);

      message.error(error instanceof Error ? error.message : 'Failed to save leave request.');
    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Close Modal
  |--------------------------------------------------------------------------
  */

  const closeModal = () => {
    setModalOpen(false);

    setEditingRecord(null);

    form.resetFields();
  };

  /*
  |--------------------------------------------------------------------------
  | Search
  |--------------------------------------------------------------------------
  */

  const filteredLeaves = leaves.filter((item) => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return true;
    }

    const leaveType = getLeaveTypeLabel(item.leaveType);

    const leaveCode = item.leaveType;

    return (
      leaveType.toLowerCase().includes(value) ||
      leaveCode.toLowerCase().includes(value) ||
      item.reason.toLowerCase().includes(value) ||
      item.status.toLowerCase().includes(value) ||
      dayjs(item.fromDate).format('DD MMM YYYY').toLowerCase().includes(value) ||
      dayjs(item.toDate).format('DD MMM YYYY').toLowerCase().includes(value)
    );
  });

  /*
  |--------------------------------------------------------------------------
  | Status Color
  |--------------------------------------------------------------------------
  */

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
  | Table Columns
  |--------------------------------------------------------------------------
  */

  const columns: ColumnsType<LeaveRecord> = [
    {
      title: 'Leave Type',

      key: 'leaveType',

      width: 190,

      render: (_, record) => (
        <Tag color={getLeaveTypeColor(record.leaveType)} className="px-3 py-1">
          {getLeaveTypeLabel(record.leaveType)}
        </Tag>
      ),
    },

    {
      title: 'From',

      key: 'fromDate',

      width: 140,

      render: (_, record) => dayjs(record.fromDate).format('DD MMM YYYY'),
    },

    {
      title: 'To',

      key: 'toDate',

      width: 140,

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

      width: 250,

      ellipsis: true,
    },

    {
      title: 'Status',

      dataIndex: 'status',

      key: 'status',

      width: 120,

      render: (status: LeaveStatus) => <Tag color={getStatusColor(status)}>{status}</Tag>,
    },

    {
      title: 'Action',

      key: 'action',

      width: 170,

      fixed: 'right',

      render: (_, record) => (
        <Space size="small">
          {record.status === 'Pending' && (
            <>
              <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
           
              </Button>

              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                loading={loading}
                onClick={() => handleDelete(record._id)}
              >
            
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Apply Leave</h1>

          <p className="mt-1 text-slate-500">
            Submit a leave request and track its approval status.
          </p>
        </div>

        <Button type="primary" size="large" icon={<PlusOutlined />} onClick={handleAdd}>
          Apply Leave
        </Button>
      </div>

      {/* Leave History */}

      <Card
        className="rounded-xl"
        title={<div className="text-lg font-semibold">My Leave History</div>}
        extra={
          <Input
            allowClear
            prefix={<SearchOutlined className="text-slate-400" />}
            placeholder="Search leave..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-[220px]"
          />
        }
      >
        <Table<LeaveRecord>
          rowKey="_id"
          loading={fetchLoading}
          columns={columns}
          dataSource={filteredLeaves}
          scroll={{ x: 1000 }}
          pagination={{
            pageSize: 10,

            showSizeChanger: true,

            showQuickJumper: true,

            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} leaves`,
          }}
        />
      </Card>

      {/* Add / Edit Modal */}

      <Modal
        title={
          <div className="text-lg font-semibold">
            {editingRecord ? 'Edit Leave Request' : 'Apply Leave'}
          </div>
        }
        open={modalOpen}
        onCancel={closeModal}
        footer={null}
        destroyOnHidden
        width={520}
      >
        <Form form={form} layout="vertical" onFinish={onFinish} className="mt-5">
          {/* Leave Type */}

          <Form.Item
            label="Leave Type"
            name="leaveType"
            rules={[
              {
                required: true,
                message: 'Please select leave type',
              },
            ]}
          >
            <Select placeholder="Select leave type" size="large" options={LEAVE_TYPES} />
          </Form.Item>

          {/* Dates */}

          <Form.Item
            label="Leave Duration"
            name="dates"
            rules={[
              {
                required: true,
                message: 'Please select leave dates',
              },
            ]}
          >
            <RangePicker className="w-full" size="large" format="DD MMM YYYY" />
          </Form.Item>

          {/* Reason */}

          <Form.Item
            label="Reason"
            name="reason"
            rules={[
              {
                required: true,
                message: 'Please enter reason',
              },
            ]}
          >
            <TextArea rows={4} placeholder="Reason for leave..." showCount maxLength={500} />
          </Form.Item>

          {/* Actions */}

          <div className="flex justify-end gap-3 pt-2">
            <Button onClick={closeModal}>Cancel</Button>

            <Button
              htmlType="submit"
              type="primary"
              icon={editingRecord ? <EditOutlined /> : <SendOutlined />}
              loading={loading}
            >
              {editingRecord ? 'Update Leave' : 'Submit Leave'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
