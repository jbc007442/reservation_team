'use client';

import Link from 'next/link';
import { createElement } from 'react';
import { Tag } from 'antd';

export const userColumns = [
  {
    title: 'Employee ID',
    dataIndex: 'employeeId',
    key: 'employeeId',
    render: (employeeId: string, record: any) =>
      createElement(
        Link,
        {
          href: `/admin/users/${record._id}`,
          className: 'text-blue-600 hover:underline',
        },
        employeeId
      ),
  },
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
  },
  {
    title: 'Phone',
    dataIndex: 'phone',
    key: 'phone',
  },
  {
    title: 'Role',
    dataIndex: 'role',
    key: 'role',
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: (status: string) =>
      createElement(
        Tag,
        { color: status === 'active' ? 'green' : 'red' },
        status.charAt(0).toUpperCase() + status.slice(1)
      ),
  },
];