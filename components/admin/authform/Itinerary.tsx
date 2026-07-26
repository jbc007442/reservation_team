'use client';

import { useEffect, useState } from 'react';
import { Card, Descriptions, Empty, Table, Image } from 'antd';

import { Booking } from '@/components/admin/booking/types';

interface Passenger {
  title: string;
  firstName: string;
  lastName: string;
  gender: string;
  dob: string;
}

export default function Itinerary({ booking }: { booking: Booking }) {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const loadItinerary = async () => {
      const res = await fetch(`/api/authform/booking/${booking._id}`);
      const result = await res.json();

      if (result.data) {
        setData(result.data);
      }
    };

    loadItinerary();
  }, [booking._id]);

  const columns = [
    {
      title: 'Passenger',
      render: (_: any, record: Passenger) =>
        `${record.title} ${record.firstName} ${record.lastName}`,
    },
    {
      title: 'Gender',
      dataIndex: 'gender',
    },
    {
      title: 'DOB',
      render: (_: any, record: Passenger) =>
        record.dob ? new Date(record.dob).toLocaleDateString() : '-',
    },
  ];

  return (
    <Card title="Itinerary">
      {data ? (
        <>
          <Descriptions bordered column={2} style={{ marginBottom: 20 }}>
            <Descriptions.Item label="Booking ID">{data.bookingReferenceNo}</Descriptions.Item>

            <Descriptions.Item label="Customer">
              {booking.customer.title} {booking.customer.name}
            </Descriptions.Item>
          </Descriptions>

          <Table
            rowKey={(_, index) => String(index)}
            columns={columns}
            dataSource={data.passengers || []}
            pagination={false}
            style={{ marginBottom: 20 }}
          />

          {data.bookingDetails ? (
            <Image
              src={data.bookingDetails}
              alt="Booking Details"
              width="100%"
              style={{
                borderRadius: 8,
                border: '1px solid #f0f0f0',
              }}
              preview
            />
          ) : (
            <Empty description="No booking details uploaded" />
          )}
        </>
      ) : (
        <Empty description="No itinerary found" />
      )}
    </Card>
  );
}
