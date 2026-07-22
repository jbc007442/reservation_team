'use client';

import { useEffect, useMemo, useState } from 'react';

// import { Card, Input, Table, Typography } from 'antd';
import { Card, Input, Table, Typography, Skeleton } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { SearchOutlined } from '@ant-design/icons';

import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';

import SortableRow from './SortableRow';

const { Title } = Typography;

interface TableProps<T extends { id: string }> {
  title: string;
  data: T[];
  columns: ColumnsType<T>;
  loading?: boolean;
}

export default function DashboardTable<T extends { id: string }>({
  title,
  data,
  columns,
  loading = false,
}: TableProps<T>) {
  const [tableData, setTableData] = useState<T[]>(data);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setTableData(data);
  }, [data]);

  const filteredData = useMemo(() => {
    return tableData.filter((item) =>
      Object.values(item).join(' ').toLowerCase().includes(search.toLowerCase())
    );
  }, [tableData, search]);

  return (
    <Card style={{ marginTop: 24 }}>
      <Skeleton active loading={loading} paragraph={{ rows: 8 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 20,
          }}
        >
          <Title level={4} style={{ margin: 0 }}>
            {title}
          </Title>

          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 300 }}
          />
        </div>

        <DndContext
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={({ active, over }) => {
            if (!over || active.id === over.id) return;

            setTableData((prev) => {
              const oldIndex = prev.findIndex((i) => i.id === active.id);
              const newIndex = prev.findIndex((i) => i.id === over.id);

              return arrayMove(prev, oldIndex, newIndex);
            });
          }}
        >
          <SortableContext
            items={filteredData.map((item) => item.id)}
            strategy={verticalListSortingStrategy}
          >
            <Table<T>
              rowKey="id"
              columns={columns}
              dataSource={filteredData}
              pagination={{
                pageSize: 5,
              }}
              components={{
                body: {
                  row: SortableRow,
                },
              }}
            />
          </SortableContext>
        </DndContext>
      </Skeleton>
    </Card>
  );
}
