'use client';

import { Form, Select } from 'antd';
import { bookingTypeOptions, termsTemplates } from './constants';
import { BookingTypeProps } from './types';

export default function BookingType({ booking, setBookingType, setTerms }: BookingTypeProps) {
  return (
    <Form.Item label="Booking Type" name="bookingType" initialValue={booking.service}>
      <Select
        placeholder="Select Booking Type"
        options={bookingTypeOptions}
        onChange={(value: string) => {
          setBookingType(value);
          setTerms(termsTemplates[value as keyof typeof termsTemplates]);
        }}
      />
    </Form.Item>
  );
}
