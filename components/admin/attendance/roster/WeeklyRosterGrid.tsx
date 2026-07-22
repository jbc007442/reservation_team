'use client';

import { useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import weekday from 'dayjs/plugin/weekday';
import updateLocale from 'dayjs/plugin/updateLocale';

import { employees as initialEmployees } from './dummyData';
import RosterEmployeeRow from './RosterEmployeeRow';

dayjs.extend(weekday);
dayjs.extend(updateLocale);

dayjs.updateLocale('en', {
  weekStart: 1,
});

interface Props {
  currentWeek: Dayjs;
}

export default function WeeklyRosterGrid({ currentWeek }: Props) {
  const [employees, setEmployees] = useState(initialEmployees);

  const startOfWeek = currentWeek.startOf('week');

  const weekDays = Array.from({ length: 7 }, (_, index) => startOfWeek.add(index, 'day'));

  const updateRoster = (
    employeeId: string,
    day: 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun',
    value: string
  ) => {
    setEmployees((prev) =>
      prev.map((emp) =>
        emp.id === employeeId
          ? {
              ...emp,
              roster: {
                ...emp.roster,
                [day]: value,
              },
            }
          : emp
      )
    );
  };

  return (
    <div className="overflow-auto rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
      <table className="min-w-full w-max border-separate border-spacing-0">
        <thead className="sticky top-0 z-30 bg-slate-50">
          <tr>
            <th className="sticky left-0 z-50 w-52 min-w-52 bg-slate-50 px-3 py-3 text-left font-semibold text-slate-700">
              Employee
            </th>

            <th className="sticky left-52 z-40 w-32 min-w-32 bg-slate-50 px-2 py-3 text-center font-semibold text-slate-700">
              Department
            </th>

            {weekDays.map((day) => (
              <th
                key={day.format('YYYY-MM-DD')}
                className="w-16 min-w-16 bg-slate-50 px-1 py-3 text-center"
              >
                <div className="text-sm font-semibold text-slate-700">{day.format('ddd')}</div>

                <div className="mt-0.5 text-[11px] text-slate-500">{day.format('DD MMM')}</div>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {employees.map((employee) => (
            <RosterEmployeeRow key={employee.id} employee={employee} onChange={updateRoster} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
