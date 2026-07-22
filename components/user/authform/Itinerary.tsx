'use client';

import React from 'react';
import { Booking } from '@/components/user/booking/types';

import { Button, Card, Col, Empty, Flex, Row, Space, Statistic, Timeline, Typography } from 'antd';

import {
  CalendarOutlined,
  EnvironmentOutlined,
  EyeOutlined,
  PlusOutlined,
  ScheduleOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

interface ItineraryProps {
  booking: Booking;
}

export default function Itinerary({ booking }: ItineraryProps) {
  return (
    <div className="space-y-6">
      <Card>
        <Title level={4}>Itinerary</Title>

        <Space direction="vertical" size={4}>
          <Text>
            <strong>Booking No:</strong> {booking.bookingNo}
          </Text>

          <Text>
            <strong>Customer:</strong> {booking.customer.name}
          </Text>

          <Text>
            <strong>Route:</strong> {booking.journey.fromCity} → {booking.journey.toCity}
          </Text>

          <Text>
            <strong>Departure:</strong>{' '}
            {new Date(booking.journey.departureDate).toLocaleDateString()}
          </Text>

          {booking.journey.returnDate && (
            <Text>
              <strong>Return:</strong> {new Date(booking.journey.returnDate).toLocaleDateString()}
            </Text>
          )}

          <Text>
            <strong>Passengers:</strong> {booking.journey.adults} Adult
            {booking.journey.children > 0 && `, ${booking.journey.children} Child`}
            {booking.journey.infants > 0 && `, ${booking.journey.infants} Infant`}
          </Text>

          <Text>
            <strong>Service:</strong> {booking.service}
          </Text>

          <Text>
            <strong>Status:</strong> {booking.status}
          </Text>
        </Space>
      </Card>
    </div>
  );
}
