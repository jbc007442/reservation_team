'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, Col, Empty, Input, Modal, Row, Skeleton, Table, Typography, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { TableRowSelection } from 'antd/es/table/interface';

import { bookingColumns } from './columns';
import { Booking } from './types';
import BookingDialog from './BookingDialog';

const { Title, Text } = Typography;

export default function BookingTable() {
  const [data, setData] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // Edit Dialog
  const [open, setOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async (bookingNo = '') => {
    try {
      setLoading(true);

      const url = bookingNo
        ? `/api/booking?bookingNo=${encodeURIComponent(bookingNo)}`
        : '/api/booking';

      const res = await fetch(url, {
        credentials: 'include',
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || 'Failed to fetch bookings');
      }

      setData(result.data || []);
    } catch (err: any) {
      message.error(err.message || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (booking: Booking) => {
    setEditingBooking(booking);
    setOpen(true);
  };

  const handleDelete = (booking: Booking) => {
    Modal.confirm({
      title: 'Delete Booking',
      content: `Are you sure you want to delete booking ${booking.bookingNo}?`,
      okText: 'Delete',
      okButtonProps: {
        danger: true,
      },
      onOk: async () => {
        try {
          const res = await fetch(`/api/booking/${booking._id}`, {
            method: 'DELETE',
          });

          const result = await res.json();

          if (!res.ok) {
            throw new Error(result.message || 'Failed to delete booking');
          }

          message.success('Booking deleted successfully');
          fetchBookings();
        } catch (err: any) {
          message.error(err.message || 'Failed to delete booking');
        }
      },
    });
  };

  const handleClose = () => {
    setOpen(false);
    setEditingBooking(null);
  };

  const handleSuccess = () => {
    handleClose();
    fetchBookings();
  };

  const columns = bookingColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
  });

  const filteredData = data;

  const rowSelection: TableRowSelection<Booking> = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
  };

  return (
    <>
      <Card
        variant="borderless"
        style={{
          borderRadius: 12,
        }}
      >
        <Row
          justify="space-between"
          align="middle"
          style={{
            marginBottom: 20,
          }}
        >
          <Col>
            <Title level={4} style={{ margin: 0 }}>
              Bookings
            </Title>

            <Text type="secondary">Total Bookings: {filteredData.length}</Text>
          </Col>

          <Col>
            <Input
              allowClear
              prefix={<SearchOutlined />}
              placeholder="Search booking..."
              style={{ width: 320 }}
              value={search}
              // onChange={(e) => setSearch(e.target.value)}
              onChange={(e) => {
                const value = e.target.value;
                setSearch(value);
                fetchBookings(value.trim());
              }}
            />
          </Col>
        </Row>

        {loading ? (
          <>
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton.Input
                key={index}
                active
                block
                style={{
                  height: 32,
                  marginBottom: 12,
                }}
              />
            ))}
          </>
        ) : (
          <Table<Booking>
            rowKey="_id"
            columns={columns}
            dataSource={filteredData}
            rowSelection={rowSelection}
            bordered
            sticky
            size="middle"
            scroll={{
              x: 1900,
              y: 600,
            }}
            locale={{
              emptyText: (
                <Empty description="No bookings found" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              ),
            }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              pageSizeOptions: ['10', '20', '50', '100'],
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} bookings`,
            }}
          />
        )}
      </Card>

      <BookingDialog
        open={open}
        booking={editingBooking}
        onClose={handleClose}
        onSuccess={handleSuccess}
      />
    </>
  );
}