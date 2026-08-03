'use client';

import { Button, Input, Table } from 'antd';
import { useState } from 'react';
import { Booking } from '@/components/admin/booking/types';

interface Passenger {
  title: string;
  firstName: string;
  lastName: string;
  gender: string;
  dob: string;
}

interface Props {
  booking: Booking;
  passengers: Passenger[];
}

export default function Eticket({ booking, passengers }: Props) {
  const [tickets, setTickets] = useState<Record<number, string>>({});

  const handleTicketChange = (index: number, value: string) => {
    setTickets((prev) => ({
      ...prev,
      [index]: value,
    }));
  };

  const sendTicket = async (record: Passenger, index: number) => {
    const ticketNo = tickets[index];

    if (!ticketNo) {
      return;
    }

    console.log({
      bookingId: booking._id,
      passenger: record,
      ticketNo,
    });

    // await fetch('/api/eticket', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     bookingId: booking._id,
    //     passenger: record,
    //     ticketNo,
    //   }),
    // });
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
        <Button type="primary" onClick={() => sendTicket(record, index)}>
          Send Ticket
        </Button>
      ),
    },
  ];

  return (
    <Table
      rowKey={(_, index) => String(index)}
      columns={columns}
      dataSource={passengers}
      pagination={false}
    />
  );
}
