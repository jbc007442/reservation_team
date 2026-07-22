'use client';

'use client';

import { useState } from 'react';
import dayjs from 'dayjs';

import Legend from '@/components/admin/attendance/roster/Legend';
import RosterControls from '@/components/admin/attendance/roster/RosterControls';
import WeeklyRosterGrid from '@/components/admin/attendance/roster/WeeklyRosterGrid';

export default function Page() {
  const [currentWeek, setCurrentWeek] = useState(dayjs());

  return (
    <div className="space-y-6 p-6">
      {/* Header + Week Navigation + Toolbar */}
      <RosterControls currentWeek={currentWeek} setCurrentWeek={setCurrentWeek} />

      {/* Weekly Roster */}
      <WeeklyRosterGrid currentWeek={currentWeek} />

      {/* Legend */}
      <Legend />
    </div>
  );
}
