'use client';

import { useEffect, useState } from 'react';
import StatsCards from '@/components/shared/cards/StatsCards';
import Table from '@/components/shared/table/Table';

import { stats } from './stats';
import { bookingColumns } from './dashboardColumns';
import { bookingData } from './dashboardData';

export default function Dashboard() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const timer = setTimeout(() => {
        setLoading(false);
      }, 1500);

      return () => clearTimeout(timer);
    }, []);
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <StatsCards stats={stats} loading={loading} />

      <Table
        title="Recent Bookings"
        columns={bookingColumns}
        data={bookingData as any}
        loading={loading}
      />
    </div>
  );
}
