'use client';

import { useEffect, useState } from 'react';
import { Booking } from '@/components/admin/booking/types';
import { Card, Spin, Alert, Empty } from 'antd';

interface ItineraryProps {
  booking: Booking;
}

interface AuthForm {
  bookingDetails: string;
}

export default function Itinerary({ booking }: ItineraryProps) {
  const [authForm, setAuthForm] = useState<AuthForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!booking?._id) return;

    const fetchAuthForm = async () => {
      try {
        setLoading(true);

        const res = await fetch(`/api/authform/booking/${booking._id}`);
        const json = await res.json();

        if (!res.ok || !json.success) {
          throw new Error(json.message || 'Failed to fetch itinerary');
        }

        setAuthForm(json.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAuthForm();
  }, [booking._id]);

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Spin size="large" />
      </div>
    );

  if (error) return <Alert type="error" message={error} />;

  return (
    <Card
      title="Itinerary"
      className="shadow-sm"
      styles={{
        body: {
          padding: 20,
        },
      }}
    >
      {authForm?.bookingDetails ? (
        <div className="itinerary-preview">
          <div
            dangerouslySetInnerHTML={{
              __html: authForm.bookingDetails,
            }}
          />
        </div>
      ) : (
        <Empty description="No itinerary found" />
      )}
    </Card>
  );
}
