'use client';

import { useEffect, useState } from 'react';
import { Button, Input, message, Table } from 'antd';

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

  const sendTicket = async (record: Passenger, index: number) => {
    const ticketNo = tickets[index]?.trim();

    if (!ticketNo) {
      message.warning('Please enter the E-Ticket Number.');
      return;
    }

    try {
      const res = await fetch('/api/authform/eticket', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId: booking._id,
          passengerIndex: index,
          ticketNo,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to save E-Ticket.');
      }

      setTickets((prev) => ({
        ...prev,
        [index]: ticketNo,
      }));

      message.success('E-Ticket updated successfully.');
    } catch (error: any) {
      message.error(error.message || 'Failed to update E-Ticket.');
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
    {
      title: 'Action',
      render: (_: any, record: Passenger, index: number) => (
        <Button
          type="primary"
          onClick={() => sendTicket(record, index)}
          disabled={!tickets[index]?.trim()}
        >
          Save
        </Button>
      ),
    },
  ];

  return (
    <Table
      rowKey={(record) => `${record.firstName}-${record.lastName}-${record.dob}`}
      columns={columns}
      dataSource={passengers}
      pagination={false}
    />
  );
}
