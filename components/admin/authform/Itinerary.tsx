'use client';

import { useEffect, useState } from 'react';
import { Card, Descriptions, Empty, Table, Image } from 'antd';

import { Booking } from '@/components/admin/booking/types';
import FlightCard from './form/FlightCard';

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
      try {
        const res = await fetch(`/api/authform/booking/${booking._id}`);
        const result = await res.json();

        if (result.data) {
          setData(result.data);
        }
      } catch (err) {
        console.error(err);
      }
    };

    loadItinerary();
  }, [booking._id]);

  const passengerColumns = [
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

  if (!data) {
    return (
      <Card title="Itinerary">
        <Empty description="No itinerary found" />
      </Card>
    );
  }

  return (
    <Card title="Itinerary">
      <Descriptions bordered column={2} style={{ marginBottom: 20 }}>
        <Descriptions.Item label="Booking ID">{data.bookingReferenceNo}</Descriptions.Item>

        <Descriptions.Item label="Customer">
          {booking.customer.title} {booking.customer.name}
        </Descriptions.Item>
      </Descriptions>

      <Table
        rowKey={(_, index) => String(index)}
        columns={passengerColumns}
        dataSource={data.passengers || []}
        pagination={false}
        style={{ marginBottom: 20 }}
      />

      {/* IMAGE MODE */}
      {data.bookingDetailsType === 'image' && data.bookingDetails ? (
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
      ) : null}

      {/* API MODE */}
      {data.bookingDetailsType === 'api' && data.itineraryData ? (
        <>
          {data.itineraryData.departure && (
            <Card title="Departure Flight" size="small" style={{ marginBottom: 20 }}>
              <FlightCard flight={data.itineraryData.departure} selected showButton={false} />
            </Card>
          )}

          {data.itineraryData.return && (
            <Card title="Return Flight" size="small">
              <FlightCard flight={data.itineraryData.return} selected showButton={false} />
            </Card>
          )}
        </>
      ) : null}

      {!data.bookingDetails && !data.itineraryData && (
        <Empty description="No itinerary available" />
      )}
    </Card>
  );
}
