'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Card,
  DatePicker,
  Empty,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';

type HolidayType = 'Public Holiday' | 'National Holiday' | 'Festival';

interface Holiday {
  _id: string;
  title: string;
  date: string;
  description: string;
  holidayType: HolidayType;
  isOptional: boolean;
  isRecurring: boolean;
  status: 'active' | 'inactive';
}

interface HolidayFormValues {
  title: string;
  date: Dayjs;
  holidayType: HolidayType;
}

const holidayTypes: HolidayType[] = ['National Holiday', 'Public Holiday', 'Festival'];

export default function Holidays() {
  const [form] = Form.useForm<HolidayFormValues>();

  const [holidays, setHolidays] = useState<Holiday[]>([]);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);

  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);

  const [search, setSearch] = useState('');

  /*
   * Fetch holidays
   */
  const fetchHolidays = async () => {
    try {
      setLoading(true);

      const response = await fetch('/api/admin/attendance/holidays?status=active', {
        method: 'GET',
        cache: 'no-store',
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to fetch holidays.');
      }

      setHolidays(result.data || []);
    } catch (error) {
      console.error('Holiday fetch error:', error);

      message.error(error instanceof Error ? error.message : 'Failed to fetch holidays.');
    } finally {
      setLoading(false);
    }
  };

  /*
   * Initial load
   */
  useEffect(() => {
    fetchHolidays();
  }, []);

  /*
   * Open Add Modal
   */
  const openAddModal = () => {
    setEditingHoliday(null);

    form.resetFields();

    setModalOpen(true);
  };

  /*
   * Open Edit Modal
   */
  const openEditModal = (holiday: Holiday) => {
    setEditingHoliday(holiday);

    form.setFieldsValue({
      title: holiday.title,
      date: dayjs(holiday.date),
      holidayType: holiday.holidayType,
    });

    setModalOpen(true);
  };

  /*
   * Close Modal
   */
  const closeModal = () => {
    if (saving) {
      return;
    }

    setModalOpen(false);

    setEditingHoliday(null);

    form.resetFields();
  };

  /*
   * Add / Update Holiday
   */
  const handleSubmit = async (values: HolidayFormValues) => {
    try {
      setSaving(true);

      const payload = {
        title: values.title.trim(),

        date: values.date.format('YYYY-MM-DD'),

        holidayType: values.holidayType,

        description: '',

        isOptional: false,

        isRecurring: true,
      };

      /*
       * UPDATE
       */
      if (editingHoliday) {
        const response = await fetch(`/api/admin/attendance/holidays/${editingHoliday._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || 'Failed to update holiday.');
        }

        message.success('Holiday updated successfully.');

        closeModal();

        await fetchHolidays();

        return;
      }

      /*
       * CREATE
       */
      const response = await fetch('/api/admin/attendance/holidays', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to create holiday.');
      }

      message.success('Holiday added successfully.');

      closeModal();

      await fetchHolidays();
    } catch (error) {
      console.error('Holiday save error:', error);

      message.error(error instanceof Error ? error.message : 'Failed to save holiday.');
    } finally {
      setSaving(false);
    }
  };

  /*
   * Delete Holiday
   */
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/attendance/holidays/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to delete holiday.');
      }

      message.success('Holiday deleted successfully.');

      await fetchHolidays();
    } catch (error) {
      console.error('Holiday delete error:', error);

      message.error(error instanceof Error ? error.message : 'Failed to delete holiday.');
    }
  };

  /*
   * Search
   */
  const filteredHolidays = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return holidays;
    }

    return holidays.filter((holiday) => {
      const title = holiday.title?.toLowerCase() || '';

      const type = holiday.holidayType?.toLowerCase() || '';

      const date = dayjs(holiday.date).format('DD MMM YYYY').toLowerCase();

      return title.includes(value) || type.includes(value) || date.includes(value);
    });
  }, [holidays, search]);

  /*
   * Table columns
   */
  const columns: ColumnsType<Holiday> = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      width: 180,

      render: (date: string) => (
        <span className="font-medium text-slate-700">{dayjs(date).format('DD MMM YYYY')}</span>
      ),
    },

    {
      title: 'Holiday Name',
      dataIndex: 'title',
      key: 'title',
      width: '35%',

      render: (title: string) => <span className="font-medium text-slate-800">{title}</span>,
    },

    {
      title: 'Type',
      dataIndex: 'holidayType',
      key: 'holidayType',
      width: '30%',

      render: (type: HolidayType) => {
        let color = 'blue';

        if (type === 'National Holiday') {
          color = 'red';
        }

        if (type === 'Festival') {
          color = 'green';
        }

        return (
          <Tag color={color} className="rounded-full px-3 py-1">
            {type}
          </Tag>
        );
      },
    },

    {
      title: 'Action',
      key: 'action',
      width: 160,
      align: 'right',

      render: (_, record) => (
        <Space size="small">
          <Button icon={<EditOutlined />} onClick={() => openEditModal(record)}>
            
          </Button>

          <Popconfirm
            title="Delete holiday?"
            description="This holiday will be removed from the active list."
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{
              danger: true,
            }}
            onConfirm={() => handleDelete(record._id)}
          >
            <Button danger icon={<DeleteOutlined />}>
              
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Holiday Management</h1>

          <p className="mt-1 text-slate-500">Create and manage company holidays.</p>
        </div>

        <Button type="primary" size="large" icon={<PlusOutlined />} onClick={openAddModal}>
          Add Holiday
        </Button>
      </div>

      {/* Holiday List */}
      <Card
        className="rounded-xl"
        styles={{
          body: {
            padding: 0,
          },
        }}
      >
        {/* Toolbar */}
        <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-slate-800">Holiday List</h2>

              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                {filteredHolidays.length}
              </span>
            </div>

            <p className="mt-1 text-sm text-slate-500">Manage all company holidays</p>
          </div>

          {/* Search */}
          <div className="flex w-full sm:w-auto">
            <Input
              allowClear
              size="large"
              prefix={<SearchOutlined className="text-slate-400" />}
              placeholder="Search holidays..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full sm:w-[320px]"
            />
          </div>
        </div>

        {/* Table */}
        <Table<Holiday>
          rowKey="_id"
          columns={columns}
          dataSource={filteredHolidays}
          loading={loading}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={search ? 'No holidays found' : 'No holidays available'}
              />
            ),
          }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} holidays`,
          }}
          scroll={{
            x: 750,
          }}
          rowClassName={() => 'hover:bg-slate-50'}
        />
      </Card>

      {/* Add / Edit Modal */}
      <Modal
        open={modalOpen}
        title={
          <div>
            <div className="text-lg font-semibold text-slate-800">
              {editingHoliday ? 'Edit Holiday' : 'Add Holiday'}
            </div>

            <div className="mt-1 text-sm font-normal text-slate-500">
              {editingHoliday ? 'Update the holiday details below.' : 'Add a new company holiday.'}
            </div>
          </div>
        }
        onCancel={closeModal}
        footer={null}
        destroyOnHidden
        width={520}
        centered
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} className="mt-6">
          {/* Holiday Name */}
          <Form.Item
            label="Holiday Name"
            name="title"
            rules={[
              {
                required: true,
                message: 'Please enter holiday name.',
              },
              {
                whitespace: true,
                message: 'Holiday name cannot be empty.',
              },
            ]}
          >
            <Input size="large" placeholder="e.g. Republic Day" maxLength={100} />
          </Form.Item>

          {/* Date */}
          <Form.Item
            label="Holiday Date"
            name="date"
            rules={[
              {
                required: true,
                message: 'Please select holiday date.',
              },
            ]}
          >
            <DatePicker
              size="large"
              className="w-full"
              format="DD MMM YYYY"
              placeholder="Select holiday date"
            />
          </Form.Item>

          {/* Holiday Type */}
          <Form.Item
            label="Holiday Type"
            name="holidayType"
            rules={[
              {
                required: true,
                message: 'Please select holiday type.',
              },
            ]}
          >
            <Select
              size="large"
              placeholder="Select holiday type"
              options={holidayTypes.map((type) => ({
                label: type,
                value: type,
              }))}
            />
          </Form.Item>

          {/* Buttons */}
          <div className="mt-6 flex justify-end gap-3 border-t border-slate-200 pt-5">
            <Button size="large" onClick={closeModal} disabled={saving}>
              Cancel
            </Button>

            <Button
              type="primary"
              size="large"
              htmlType="submit"
              loading={saving}
              icon={editingHoliday ? <EditOutlined /> : <PlusOutlined />}
            >
              {editingHoliday ? 'Update Holiday' : 'Add Holiday'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
