'use client';

import { Card, Input, Space, Table, Button } from 'antd';
import { SearchOutlined, FileExcelOutlined, FilePdfOutlined } from '@ant-design/icons';

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { reportColumns } from './column';
import type { ReportData } from './types';

const data: ReportData[] = [
  {
    key: '1',
    bookingNo: 'BK000001',
    customerName: 'Tarun Kumar',
    service: 'Flight',
    travelDate: '28 Jul 2026',
    amount: 450,
    status: 'Approved',
  },
  {
    key: '2',
    bookingNo: 'BK000002',
    customerName: 'Rahul Sharma',
    service: 'Hotel',
    travelDate: '30 Jul 2026',
    amount: 850,
    status: 'Pending',
  },
  {
    key: '3',
    bookingNo: 'BK000003',
    customerName: 'Amit Singh',
    service: 'Visa',
    travelDate: '02 Aug 2026',
    amount: 220,
    status: 'Rejected',
  },
];

export default function ReportsPage() {
  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Reports');
    XLSX.writeFile(workbook, 'Reports.xlsx');
  };

  const exportPDF = () => {
    const doc = new jsPDF();

    doc.text('Reports', 14, 15);

    autoTable(doc, {
      head: [['Booking No', 'Customer Name', 'Service', 'Travel Date', 'Amount', 'Status']],
      body: data.map((item) => [
        item.bookingNo,
        item.customerName,
        item.service,
        item.travelDate,
        `$${item.amount}`,
        item.status,
      ]),
      startY: 22,
    });

    doc.save('Reports.pdf');
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
        <Input
          placeholder="Search..."
          prefix={<SearchOutlined />}
          allowClear
          style={{ width: 300 }}
        />

        <Space>
          <Button icon={<FileExcelOutlined />} onClick={exportExcel}>
            Excel
          </Button>

          <Button type="primary" danger icon={<FilePdfOutlined />} onClick={exportPDF}>
            PDF
          </Button>
        </Space>
      </Space>

      <Table<ReportData>
        rowKey="key"
        columns={reportColumns}
        dataSource={data}
        bordered
        size="middle"
        sticky
        scroll={{
          x: 1200,
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
