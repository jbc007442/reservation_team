'use client';

import Link from 'next/link';
import { Button, Popconfirm, Space } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined, MenuOutlined } from '@ant-design/icons';

interface Props {
  onDelete: (id: string) => void;
}

export const manageUserColumns = ({ onDelete }: Props) => [
  {
    title: '',
    key: 'sort',
    width: 50,
    render: () => (
      <span
        className="drag-handle"
        style={{
          cursor: 'grab',
          color: '#999',
          fontSize: 18,
        }}
      >
        <MenuOutlined />
      </span>
    ),
  },
  {
    title: 'Employee ID',
    dataIndex: 'employeeId',
    key: 'employeeId',
  },
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Phone',
    dataIndex: 'phone',
    key: 'phone',
  },
  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
  },
  {
    title: 'Action',
    key: 'action',
    width: 180,
    render: (_: any, record: any) => (
      <Space>
        <Link href={`/admin/users/manage/${record._id}`}>
          <Button type="text" icon={<EyeOutlined />} />
        </Link>

        <Link href={`/admin/users/manage/${record._id}/edit`}>
          <Button type="text" icon={<EditOutlined />} />
        </Link>

        <Popconfirm
          title="Delete User"
          description="Are you sure?"
          onConfirm={() => {
            alert(record._id);
            console.log(record);
            onDelete(record._id);
          }}
        >
          <Button type="text" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      </Space>
    ),
  },
];
