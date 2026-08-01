import { Button, Dropdown, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  EyeOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  PrinterOutlined,
  DownloadOutlined,
} from '@ant-design/icons';

import type { ReportData } from './types';

export const reportColumns: ColumnsType<ReportData> = [
  {
    title: 'Booking No',
    dataIndex: 'bookingNo',
    key: 'bookingNo',
    width: 140,
    fixed: 'left',
  },
  {
    title: 'Customer Name',
    dataIndex: 'customerName',
    key: 'customerName',
    width: 220,
  },
  {
    title: 'Service',
    dataIndex: 'service',
    key: 'service',
    width: 140,
  },
  {
    title: 'Travel Date',
    dataIndex: 'travelDate',
    key: 'travelDate',
    width: 150,
  },
  {
    title: 'Amount',
    dataIndex: 'amount',
    key: 'amount',
    width: 120,
    align: 'right',
    render: (amount: number) => `$${amount}`,
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    width: 140,
    align: 'center',
    render: (status: ReportData['status']) => {
      const color = status === 'Approved' ? 'success' : status === 'Pending' ? 'warning' : 'error';

      return <Tag color={color}>{status}</Tag>;
    },
  },
  {
    title: '',
    key: 'action',
    width: 70,
    fixed: 'right',
    align: 'center',
    render: (_, record) => (
      <Dropdown
        trigger={['click']}
        menu={{
          items: [
            {
              key: 'view',
              icon: <EyeOutlined />,
              label: 'View',
            },
            {
              key: 'edit',
              icon: <EditOutlined />,
              label: 'Edit',
            },
            {
              key: 'pdf',
              icon: <DownloadOutlined />,
              label: 'Download PDF',
            },
            {
              key: 'print',
              icon: <PrinterOutlined />,
              label: 'Print',
            },
            {
              type: 'divider',
            },
            {
              key: 'delete',
              danger: true,
              icon: <DeleteOutlined />,
              label: 'Delete',
            },
          ],
          onClick: ({ key }) => {
            console.log(key, record);
          },
        }}
      >
        <Button type="text" icon={<MoreOutlined style={{ fontSize: 18 }} />} />
      </Dropdown>
    ),
  },
];
