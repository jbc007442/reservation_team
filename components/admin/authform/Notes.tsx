'use client';

import React from 'react';
import { Booking } from '@/components/admin/booking/types';

interface NotesProps {
  booking: Booking;
}

export default function Notes({ booking }: NotesProps) {
  return (
    <div>
      <h3>Notes</h3>

      <p>Booking No: {booking.bookingNo}</p>
      <p>Customer: {booking.customer.name}</p>
    </div>
  );
}
