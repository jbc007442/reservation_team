'use client';

import { Button, Popconfirm, Space, Spin, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

import type { DprData } from './DprForm';

interface DprTableProps {
  data: DprData[];
  loading?: boolean;
  onEdit?: (record: DprData) => void;
  onDelete?: (id: string) => void;
}

export default function DprTable({ data, loading, onEdit, onDelete }: DprTableProps) {
  const columns: ColumnsType<DprData> = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date) => (date ? dayjs(date).format('DD/MM/YYYY') : '-'),
    },

    {
      title: 'Agent Name',
      dataIndex: 'agentName',
      key: 'agentName',
    },

    {
      title: 'Call Type',
      dataIndex: 'callType',
      key: 'callType',
      render: (value: string) => {
        const labels: Record<string, string> = {
          buffer_call: 'BUFFER CALL',
          ppc: 'PPC',
          existing: 'EXISTING',
          expedia: 'EXPEDIA',
          meta: 'META',
        };

        return <Tag color={value === 'meta' ? 'blue' : undefined}>{labels[value] || value}</Tag>;
      },
    },

    {
      title: 'Meta',
      dataIndex: 'meta',
      key: 'meta',
      render: (value: string, record: DprData) =>
        record.callType === 'meta' ? (
          <span className="font-medium text-slate-700">{value || '-'}</span>
        ) : (
          '-'
        ),
    },

    {
      title: 'Phone Number',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
    },

    {
      title: 'Airline',
      dataIndex: 'airline',
      key: 'airline',
    },

    {
      title: 'Call Query',
      dataIndex: 'callQuery',
      key: 'callQuery',
      render: (value: string) => (value ? value.replace(/_/g, ' ').toUpperCase() : '-'),
    },

    {
      title: 'Notes',
      dataIndex: 'notes',
      key: 'notes',
      ellipsis: true,
    },

    {
      title: 'Action',
      key: 'action',
      fixed: 'right',
      width: 100,
      align: 'center',

      render: (_, record) => {
        const actions = [];

        /*
        |--------------------------------------------------------------------------
        | Edit
        |--------------------------------------------------------------------------
        */

        if (onEdit) {
          actions.push(
            <Button key="edit" type="text" icon={<EditOutlined />} onClick={() => onEdit(record)} />
          );
        }

        /*
        |--------------------------------------------------------------------------
        | Delete
        |--------------------------------------------------------------------------
        */

        if (onDelete) {
          actions.push(
            <Popconfirm
              key="delete"
              title="Delete DPR?"
              description="Are you sure you want to delete this DPR?"
              okText="Yes"
              cancelText="No"
              onConfirm={() => {
                if (record._id) {
                  onDelete(record._id);
                }
              }}
            >
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          );
        }

        /*
        |--------------------------------------------------------------------------
        | No Actions
        |--------------------------------------------------------------------------
        */

        if (actions.length === 0) {
          return null;
        }

        return <Space size="middle">{actions}</Space>;
      },
    },
  ];

  return (
    <Spin spinning={loading} tip="Loading DPR...">
      <Table
        rowKey="_id"
        columns={columns}
        dataSource={data}
        scroll={{ x: 1200 }}
        pagination={{
          pageSize: 10,
        }}
      />
    </Spin>
  );
}
