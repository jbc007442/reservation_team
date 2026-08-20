'use client';

import { useEffect, useMemo, useState } from 'react';
import { message } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import weekday from 'dayjs/plugin/weekday';
import updateLocale from 'dayjs/plugin/updateLocale';

import RosterEmployeeRow from './RosterEmployeeRow';

dayjs.extend(weekday);
dayjs.extend(updateLocale);

dayjs.updateLocale('en', {
  weekStart: 1,
});

interface Props {
  currentWeek: Dayjs;
  searchTerm: string;
}

type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

type RosterStatus = 'P' | 'WO' | 'L' | 'H' | 'HD' | 'A' | 'OD' | 'WFH';

interface Roster {
  mon: string;
  tue: string;
  wed: string;
  thu: string;
  fri: string;
  sat: string;
  sun: string;
}

interface Employee {
  _id: string;
  employeeId: string;
  name: string;
  email: string;
  department: string;
  designation: string;
  avatar: string;
  status: string;
  roster: Roster;
}

interface UserApiEmployee {
  _id: string;
  employeeId: string;
  name: string;
  email: string;
  department: string;
  designation: string;
  avatar: string;
  status: string;
}

interface RosterRecord {
  _id: string;
  employee: string | { _id: string };
  date: string;
  rosterStatus: RosterStatus;
  status: 'active' | 'inactive';
}

const emptyRoster: Roster = {
  mon: '',
  tue: '',
  wed: '',
  thu: '',
  fri: '',
  sat: '',
  sun: '',
};

const dayKeys: DayKey[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

const allowedStatuses: RosterStatus[] = ['P', 'WO', 'L', 'H', 'HD', 'A', 'OD', 'WFH'];

export default function WeeklyRosterGrid({ currentWeek, searchTerm }: Props) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const startOfWeek = currentWeek.startOf('week');

  const weekDays = Array.from({ length: 7 }, (_, index) => startOfWeek.add(index, 'day'));

  /*
   * Fetch employees + roster
   * whenever week changes.
   */
  useEffect(() => {
    fetchRosterData();
  }, [currentWeek]);

  const fetchRosterData = async () => {
    try {
      setLoading(true);

      const startDate = startOfWeek.format('YYYY-MM-DD');
      const endDate = startOfWeek.add(6, 'day').format('YYYY-MM-DD');

      const [usersResponse, rosterResponse] = await Promise.all([
        fetch('/api/admin/attendance/users'),
        fetch(`/api/admin/attendance/roster?startDate=${startDate}&endDate=${endDate}`),
      ]);

      const usersResult = await usersResponse.json();
      const rosterResult = await rosterResponse.json();

      /*
       * Users API validation
       */
      if (!usersResponse.ok || !usersResult.success) {
        throw new Error(usersResult.message || 'Failed to fetch employees');
      }

      /*
       * Roster API validation
       */
      if (!rosterResponse.ok || !rosterResult.success) {
        throw new Error(rosterResult.message || 'Failed to fetch roster');
      }

      const rosterRecords: RosterRecord[] = rosterResult.data || [];

      /*
       * Build roster lookup.
       *
       * employeeId
       *     ↓
       * date
       *     ↓
       * rosterStatus
       */
      const rosterMap = new Map<string, Map<string, RosterStatus>>();

      rosterRecords.forEach((record) => {
        const employeeId =
          typeof record.employee === 'string' ? record.employee : record.employee._id;

        if (!rosterMap.has(employeeId)) {
          rosterMap.set(employeeId, new Map<string, RosterStatus>());
        }

        rosterMap
          .get(employeeId)!
          .set(dayjs(record.date).format('YYYY-MM-DD'), record.rosterStatus);
      });

      /*
       * Merge employees with weekly roster.
       */
      const formattedEmployees: Employee[] = usersResult.data.map((employee: UserApiEmployee) => {
        const employeeRoster = rosterMap.get(employee._id);

        const roster: Roster = {
          ...emptyRoster,
        };

        weekDays.forEach((day, index) => {
          const date = day.format('YYYY-MM-DD');

          roster[dayKeys[index]] = employeeRoster?.get(date) || '';
        });

        return {
          ...employee,
          roster,
        };
      });

      setEmployees(formattedEmployees);
    } catch (error) {
      console.error('Failed to load attendance roster:', error);

      setEmployees([]);

      message.error(error instanceof Error ? error.message : 'Failed to load roster.');
    } finally {
      setLoading(false);
    }
  };

  /*
   * Save roster cell
   */
  const updateRoster = async (employeeId: string, day: DayKey, value: string) => {
    const dayIndex = dayKeys.indexOf(day);

    if (dayIndex === -1) {
      return;
    }

    /*
     * Validate roster status
     */
    if (!allowedStatuses.includes(value as RosterStatus)) {
      message.error('Invalid roster status.');

      return;
    }

    const selectedDate = startOfWeek.add(dayIndex, 'day').format('YYYY-MM-DD');

    try {
      const response = await fetch('/api/admin/attendance/roster', {
        method: 'PUT',

        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({
          employee: employeeId,
          date: selectedDate,
          rosterStatus: value as RosterStatus,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to save roster');
      }

      /*
       * Update UI after successful save.
       */
      setEmployees((prev) =>
        prev.map((employee) =>
          employee._id === employeeId
            ? {
                ...employee,

                roster: {
                  ...employee.roster,

                  [day]: value,
                },
              }
            : employee
        )
      );

      /*
       * Success toast
       */
      message.success('Roster updated successfully.');
    } catch (error) {
      console.error('Failed to save roster:', error);

      /*
       * Error toast
       */
      message.error(error instanceof Error ? error.message : 'Failed to save roster.');
    }
  };

  /*
   * Local employee search
   */
  const filteredEmployees = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) {
      return employees;
    }

    return employees.filter((employee) => {
      const name = employee.name?.toLowerCase() || '';

      const employeeId = employee.employeeId?.toLowerCase() || '';

      const email = employee.email?.toLowerCase() || '';

      const department = employee.department?.toLowerCase() || '';

      const designation = employee.designation?.toLowerCase() || '';

      return (
        name.includes(search) ||
        employeeId.includes(search) ||
        email.includes(search) ||
        department.includes(search) ||
        designation.includes(search)
      );
    });
  }, [employees, searchTerm]);

  /*
   * Loading
   */
  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <span className="text-sm text-slate-500">Loading roster...</span>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg shadow-sm">
      <table className="min-w-full border-collapse">
        <thead>
          <tr>
            {/* Number */}
            <th
              className="
                sticky left-0 z-40
                w-14 min-w-14
                bg-slate-50
                px-3 py-3
                text-center
                text-xs font-semibold
                uppercase tracking-wide
                text-slate-500
              "
            >
              #
            </th>

            {/* Employee */}
            <th
              className="
                sticky left-14 z-40
                w-64 min-w-64
                bg-slate-50
                px-4 py-3
                text-left
                text-xs font-semibold
                uppercase tracking-wide
                text-slate-600
              "
            >
              Employee
            </th>

            {/* Days */}
            {weekDays.map((day) => (
              <th
                key={day.format('YYYY-MM-DD')}
                className="
                  w-16 min-w-16
                  bg-slate-50
                  px-1 py-3
                  text-center
                "
              >
                <div className="text-sm font-semibold text-slate-700">{day.format('ddd')}</div>

                <div className="mt-0.5 text-[11px] text-slate-500">{day.format('DD MMM')}</div>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {filteredEmployees.length === 0 ? (
            <tr>
              <td colSpan={9} className="py-12 text-center text-sm text-slate-500">
                {searchTerm.trim() ? 'No employees found.' : 'No employees available.'}
              </td>
            </tr>
          ) : (
            filteredEmployees.map((employee, index) => (
              <RosterEmployeeRow
                key={employee._id}
                index={index}
                employee={employee}
                onChange={updateRoster}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
