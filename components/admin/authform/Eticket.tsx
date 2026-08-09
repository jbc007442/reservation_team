'use client';

import { useEffect, useState } from 'react';
import { Button, Input, Space, Table, message } from 'antd';

import { Booking } from '@/components/admin/booking/types';

interface Passenger {
  title: string;
  firstName: string;
  lastName: string;
  gender: string;
  dob: string;
  eTicketNo?: string;
}

interface Props {
  booking: Booking;
  passengers: Passenger[];
}

export default function Eticket({ booking, passengers }: Props) {
  const [tickets, setTickets] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const initial: Record<number, string> = {};

    passengers.forEach((passenger, index) => {
      initial[index] = passenger.eTicketNo || '';
    });

    setTickets(initial);
  }, [passengers]);

  const handleTicketChange = (index: number, value: string) => {
    setTickets((prev) => ({
      ...prev,
      [index]: value,
    }));
  };

  const sendTickets = async () => {
    const payload = passengers.map((_, index) => ({
      passengerIndex: index,
      ticketNo: tickets[index]?.trim() || '',
    }));

    try {
      setLoading(true);

      const res = await fetch('/api/authform/eticket', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId: booking._id,
          tickets: payload,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to save E-Tickets.');
      }

      message.success(data.message || 'E-Tickets saved successfully.');
    } catch (error: any) {
      message.error(error.message || 'Failed to save E-Tickets.');
    } finally {
      setLoading(false);
    }
  };

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
    {
      title: 'E-Ticket Number',
      render: (_: any, record: Passenger, index: number) => (
        <Input
          placeholder="125-1234567890"
          value={tickets[index] || ''}
          onChange={(e) => handleTicketChange(index, e.target.value)}
        />
      ),
    },
  ];

  return (
    <Space
      orientation="vertical"
      size={16}
      style={{
        width: '100%',
      }}
    >
      <Table
        rowKey={(record) => `${record.firstName}-${record.lastName}-${record.dob}`}
        columns={columns}
        dataSource={passengers}
        pagination={false}
      />

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
        }}
      >
        <Button type="primary" loading={loading} onClick={sendTickets}>
          Save & Send E-Tickets
        </Button>
      </div>
    </Space>
  );
}
