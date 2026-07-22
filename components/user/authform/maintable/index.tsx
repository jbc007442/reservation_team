'use client';

import { useEffect, useMemo, useState } from 'react';

import { Card, Empty, Skeleton, Table, message } from 'antd';
import type { TableRowSelection } from 'antd/es/table/interface';

import Header from './Header';
import { authFormColumns } from './columns';
import { AuthForm } from './types';

export default function MainTable() {
  const [data, setData] = useState<AuthForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  useEffect(() => {
    fetchAuthForms();
  }, []);

  const fetchAuthForms = async () => {
    try {
      setLoading(true);

      const response = await fetch('/api/authform');

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message);
      }

      setData(result.data);
    } catch (error: any) {
      message.error(error.message || 'Failed to load authorization forms');
    } finally {
      setLoading(false);
    }
  };

  const filteredData = useMemo(() => {
    if (!search.trim()) return data;

    const keyword = search.toLowerCase();

    return data.filter((item) =>
      [
        item.bookingId?.bookingNo,
        item.bookingId?.customer?.name,
        item.bookingId?.customer?.email,
        item.bookingType,
        item.serviceType,
        item.approval?.status,
        item.approval?.approvedBy?.ipAddress,
      ]
        .join(' ')
        .toLowerCase()
        .includes(keyword)
    );
  }, [data, search]);

  const rowSelection: TableRowSelection<AuthForm> = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
  };

  return (
    <Card
      variant="borderless"
      style={{
        borderRadius: 16,
      }}
    >
      <Header total={filteredData.length} search={search} onSearch={setSearch} />

      {loading ? (
        <>
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton.Input
              key={index}
              active
              block
              style={{
                height: 36,
                marginBottom: 12,
              }}
            />
          ))}
        </>
      ) : (
        <Table<AuthForm>
          rowKey="_id"
          columns={authFormColumns as any}
          dataSource={filteredData}
          rowSelection={rowSelection}
          bordered
          size="middle"
          scroll={{ x: 1200 }}
          locale={{
            emptyText: (
              <Empty
                description="No authorization forms found"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ),
          }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} forms`,
          }}
        />
      )}
    </Card>
  );
}
