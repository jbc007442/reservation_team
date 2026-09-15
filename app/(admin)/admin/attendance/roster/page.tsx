'use client';

import { useState } from 'react';
import dayjs from 'dayjs';

import Legend from '@/components/admin/attendance/roster/Legend';
import RosterControls from '@/components/admin/attendance/roster/RosterControls';
import WeeklyRosterGrid from '@/components/admin/attendance/roster/WeeklyRosterGrid';

export default function Page() {
  const [currentWeek, setCurrentWeek] = useState(dayjs());
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6 p-6">
      <RosterControls
        currentWeek={currentWeek}
        setCurrentWeek={setCurrentWeek}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      <Legend />

      <WeeklyRosterGrid currentWeek={currentWeek} searchTerm={searchTerm} />
    </div>
  );
}