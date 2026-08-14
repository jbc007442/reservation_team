'use client';

import { Card, Descriptions, Empty, Image, Table, Tabs } from 'antd';
import { useEffect, useState } from 'react';

import { Booking } from '@/components/admin/booking/types';
import Eticket from './Eticket';
import FlightCard from './form/flight/FlightCard';

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
      } catch (error) {
        console.error(error);
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

  return (
    <Card>
      <Tabs
        defaultActiveKey="itinerary"
        items={[
          {
            key: 'itinerary',
            label: 'Itinerary',
            children: !data ? (
              <Empty description="No itinerary found" />
            ) : (
              <>
                <Descriptions bordered column={2} style={{ marginBottom: 20 }}>
                  <Descriptions.Item label="Booking ID">
                    {data.bookingReferenceNo}
                  </Descriptions.Item>

                  <Descriptions.Item label="Customer">
                    {booking.customer.title} {booking.customer.name}
                  </Descriptions.Item>
                </Descriptions>

                <Table
                  rowKey="_id"
                  columns={passengerColumns}
                  dataSource={data.passengers || []}
                  pagination={false}
                  style={{ marginBottom: 20 }}
                />

                {data.bookingDetailsType === 'image' && data.bookingDetails && (
                  <Image
                    src={data.bookingDetails}
                    width="100%"
                    preview
                    style={{ marginBottom: 20 }}
                  />
                )}

                {data.bookingDetailsType === 'api' && data.itineraryData && (
                  <>
                    {data.itineraryData.departure && (
                      <Card title="Departure Flight" size="small" style={{ marginBottom: 20 }}>
                        <FlightCard
                          flight={data.itineraryData.departure}
                          selected
                          showButton={false}
                        />
                      </Card>
                    )}

                    {data.itineraryData.return && (
                      <Card title="Return Flight" size="small">
                        <FlightCard
                          flight={data.itineraryData.return}
                          selected
                          showButton={false}
                        />
                      </Card>
                    )}
                  </>
                )}

                {!data.bookingDetails && !data.itineraryData && (
                  <Empty description="No itinerary available" />
                )}
              </>
            ),
          },
          {
            key: 'eticket',
            label: 'E-Ticket',
            children: <Eticket booking={booking} passengers={data?.passengers || []} />,
          },
        ]}
      />
    </Card>
  );
}