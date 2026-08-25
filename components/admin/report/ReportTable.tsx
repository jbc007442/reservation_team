'use client';

import { useEffect, useState } from 'react';
import { Card, Input, Space, Table, Button, Select, message, Dropdown } from 'antd';
import {
  SearchOutlined,
  MoreOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
} from '@ant-design/icons';

import { reportColumns } from './column';
import type { ReportData } from './types';

export default function ReportsPage() {
  const [data, setData] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('All');

  const fetchReports = async (searchValue = '', statusValue = 'All') => {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      if (searchValue.trim()) {
        params.set('search', searchValue.trim());
      }

      if (statusValue && statusValue !== 'All') {
        params.set('status', statusValue);
      }

      const response = await fetch(`/api/reports/booking?${params.toString()}`, {
        method: 'GET',
        cache: 'no-store',
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to fetch reports.');
      }

      setData(result.data || []);
    } catch (error) {
      console.error('Reports fetch error:', error);

      message.error(error instanceof Error ? error.message : 'Failed to fetch reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchReports(search, status);
    }, 400);

    return () => clearTimeout(timer);
  }, [search, status]);

  /*
  |--------------------------------------------------------------------------
  | Excel Export
  |--------------------------------------------------------------------------
  */

  const exportExcel = async () => {
    try {
      if (!data.length) {
        message.warning('No report data to export.');
        return;
      }

      const XLSX = await import('xlsx');

      const exportData = data.map((item) => ({
        'Booking No': item.bookingNo,
        'Customer Name': item.customerName,
        'Created By': item.createdBy,
        Service: item.service,
        'Service Type': item.serviceType,
        Merchant: item.merchant,
        Amount: item.amount,
        Payment: item.paymentStatus,
        Status: item.status,
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);

      const workbook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(workbook, worksheet, 'Reports');

      XLSX.writeFile(workbook, `Reports-${new Date().toISOString().split('T')[0]}.xlsx`);

      message.success('Excel exported successfully.');
    } catch (error) {
      console.error('Excel export error:', error);

      message.error('Failed to export Excel.');
    }
  };

  /*
  |--------------------------------------------------------------------------
  | PDF Export
  |--------------------------------------------------------------------------
  */

  const exportPDF = async () => {
    try {
      if (!data.length) {
        message.warning('No report data to export.');
        return;
      }

      const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
        import('jspdf'),
        import('jspdf-autotable'),
      ]);

      const doc = new jsPDF('landscape');

      doc.setFontSize(16);
      doc.text('Booking Reports', 14, 15);

      autoTable(doc, {
        head: [
          [
            'Booking No',
            'Customer',
            'Created By',
            'Service',
            'Service Type',
            'Merchant',
            'Amount',
            'Payment',
            'Status',
          ],
        ],

        body: data.map((item) => [
          item.bookingNo,
          item.customerName,
          item.createdBy,
          item.service,
          item.serviceType,
          item.merchant,
          `$${Number(item.amount || 0).toFixed(2)}`,
          item.paymentStatus,
          item.status,
        ]),

        startY: 22,

        styles: {
          fontSize: 7,
        },

        headStyles: {
          fontSize: 7,
        },
      });

      doc.save(`Reports-${new Date().toISOString().split('T')[0]}.pdf`);

      message.success('PDF exported successfully.');
    } catch (error) {
      console.error('PDF export error:', error);

      message.error('Failed to export PDF.');
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Export Dropdown
  |--------------------------------------------------------------------------
  */

  const exportMenu = {
    items: [
      {
        key: 'excel',
        icon: <FileExcelOutlined />,
        label: 'Export Excel',
        disabled: !data.length,
      },
      {
        key: 'pdf',
        icon: <FilePdfOutlined />,
        label: 'Export PDF',
        disabled: !data.length,
      },
    ],

    onClick: ({ key }: { key: string }) => {
      if (key === 'excel') {
        exportExcel();
      }

      if (key === 'pdf') {
        exportPDF();
      }
    },
  };

  return (
    <Card title="Reports">
      <Space
        style={{
          marginBottom: 16,
          width: '100%',
          justifyContent: 'space-between',
        }}
      >
        <Space>
          <Input
            placeholder="Search booking, customer or merchant..."
            prefix={<SearchOutlined />}
            allowClear
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 350 }}
          />

          <Select
            value={status}
            onChange={setStatus}
            style={{ width: 220 }}
            options={[
              { label: 'All Status', value: 'All' },
              { label: 'Booking Created', value: 'booking_created' },
              { label: 'Auth Pending', value: 'auth_pending' },
              { label: 'Auth Completed', value: 'auth_completed' },
              { label: 'Ticketed', value: 'ticketed' },
              { label: 'Cancelled', value: 'cancelled' },
              { label: 'Refunded', value: 'refunded' },
              { label: 'Charge Back', value: 'charge_back' },
              { label: 'Follow Up', value: 'follow_up' },
              { label: 'Card Charged', value: 'card_charged' },
              { label: 'Card Decline', value: 'card_decline' },
            ]}
          />
        </Space>

        <Dropdown menu={exportMenu} trigger={['click']} placement="bottomRight">
          <Button icon={<MoreOutlined />} disabled={!data.length}>
            Export
          </Button>
        </Dropdown>
      </Space>

      <Table<ReportData>
        rowKey="key"
        columns={reportColumns}
        dataSource={data}
        loading={loading}
        bordered
        size="middle"
        sticky
        scroll={{
          x: 1600,
          y: 550,
        }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} records`,
          pageSizeOptions: ['10', '25', '50', '100'],
        }}
      />
    </Card>
  );
}
