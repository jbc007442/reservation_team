'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Col, Row, Spin, message } from 'antd';

import Header from '@/components/admin/authform/Header';
import AuthSidebar from '@/components/admin/authform/AuthSidebar';
import AuthTabs from '@/components/admin/authform/AuthTabs';

import { Booking } from '@/components/admin/booking/types';

export default function Page() {
  const { id } = useParams<{ id: string }>();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchBooking = async () => {
      try {
        const res = await fetch(`/api/booking/${id}`);
        const result = await res.json();

        if (!res.ok) {
          throw new Error(result.message);
        }

        setBooking(result.data);
      } catch (err) {
        const error = err as Error;
        message.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!booking) {
    return null;
  }

  return (
    <div className="space-y-6">
      <Header booking={booking} />

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={7} xl={6}>
          <AuthSidebar booking={booking} />
        </Col>

        <Col xs={24} lg={17} xl={18}>
          <AuthTabs booking={booking} />
        </Col>
      </Row>
    </div>
  );
}
