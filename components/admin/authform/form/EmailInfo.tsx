'use client';

import { Col, Form, Input, Row } from 'antd';
import { Booking } from '@/components/admin/booking/types';

interface EmailInfoProps {
  booking: Booking;
}

const maskEmail = (email?: string) => {
  if (!email) return '';

  return email.replace(/^(.{2})[^@]*(@.*)$/, '$1******$2');
};

export default function EmailInfo({ booking }: EmailInfoProps) {
  return (
    <Row gutter={16}>
      <Col xs={24} md={12}>
        <Form.Item label="Email Subject" name="emailSubject">
          <Input placeholder="NEW BOOKING" />
        </Form.Item>
      </Col>

      <Col xs={24} md={12}>
        <Form.Item label="Customer Email">
          <Input value={maskEmail(booking.customer.email)} readOnly />
        </Form.Item>
      </Col>

      <Col xs={24} md={12}>
        <Form.Item label="Booking Reference No" name="bookingReferenceNo">
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