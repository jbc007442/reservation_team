'use client';

import { useEffect, useState } from 'react';
import StatsCards from '@/components/shared/cards/StatsCards';

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
      <StatsCards />
    </div>
  );
}
