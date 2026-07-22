'use client';

import { Col, Form, Input, Row } from 'antd';
import { Booking } from '@/components/user/booking/types';

interface EmailInfoProps {
  booking: Booking;
}

export default function EmailInfo({ booking }: EmailInfoProps) {
  return (
    <Row gutter={16}>
      {/* Row 1 */}
      <Col xs={24} md={12}>
        <Form.Item label="Email Subject" name="emailSubject" initialValue="">
          <Input placeholder="NEW BOOKING" />
        </Form.Item>
      </Col>

      <Col xs={24} md={12}>
        <Form.Item
          label="Customer Email"
          name="customerEmail"
          initialValue={booking.customer.email}
        >
          <Input placeholder="customer@email.com" />
        </Form.Item>
      </Col>

      {/* Row 2 */}
      <Col xs={24} md={12}>
        <Form.Item
          label="Booking Reference No"
          name="bookingReferenceNo"
          initialValue={booking.bookingNo}
        >
          <Input placeholder="PENDING" readOnly />
        </Form.Item>
      </Col>

      {booking.callType?.toLowerCase() === 'meta' && (
        <Col xs={24} md={12}>
          <Form.Item label="Meta Reference No" name="metaReferenceNo">
            <Input placeholder="Enter Meta Reference No" />
          </Form.Item>
        </Col>
      )}
    </Row>
  );
}
