'use client';

import { Col, Form, Input, Row } from 'antd';
import { Booking } from '@/components/user/booking/types';

interface EmailInfoProps {
  booking: Booking;
}

export default function EmailInfo({ booking }: EmailInfoProps) {
  return (
    <Row gutter={16}>
      {/* Email Subject */}
      <Col xs={24} md={12}>
        <Form.Item
          label="Email Subject"
          name="emailSubject"
          rules={[
            {
              required: true,
              message: 'Please enter email subject',
            },
            {
              whitespace: true,
              message: 'Email subject cannot be empty',
            },
          ]}
        >
          <Input placeholder="NEW BOOKING" />
        </Form.Item>
      </Col>

      {/* Customer Email */}
      <Col xs={24} md={12}>
        <Form.Item
          label="Customer Email"
          name="customerEmail"
          rules={[
            {
              required: true,
              message: 'Customer email is required',
            },
            {
              type: 'email',
              message: 'Please enter a valid email address',
            },
          ]}
        >
          <Input value={booking.customer.email || ''} readOnly />
        </Form.Item>
      </Col>

      {/* Booking Reference No */}
      <Col xs={24} md={12}>
        <Form.Item
          label="Booking Reference No"
          name="bookingReferenceNo"
          rules={[
            {
              required: true,
              message: 'Booking reference number is required',
            },
            {
              whitespace: true,
              message: 'Booking reference number cannot be empty',
            },
          ]}
        >
          <Input placeholder="PENDING" readOnly />
        </Form.Item>
      </Col>

      {/* Meta Reference No */}
      {booking.callType?.toLowerCase() === 'meta' && (
        <Col xs={24} md={12}>
          <Form.Item
            label="Meta Reference No"
            name="metaReferenceNo"
            rules={[
              {
                required: true,
                message: 'Please enter Meta Reference No',
              },
              {
                whitespace: true,
                message: 'Meta Reference No cannot be empty',
              },
            ]}
          >
            <Input placeholder="Enter Meta Reference No" />
          </Form.Item>
        </Col>
      )}
    </Row>
  );
}
