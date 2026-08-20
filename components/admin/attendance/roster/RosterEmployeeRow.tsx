'use client';

import RosterCell from './RosterCell';

type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

interface Employee {
  _id: string;
  employeeId: string;
  name: string;
  email: string;
  department: string;
  designation: string;
  avatar: string;
  status: string;
  roster: Record<DayKey, string>;
}

interface Props {
  employee: Employee;
  index: number;
  onChange: (employeeId: string, day: DayKey, value: string) => void;
}

export default function RosterEmployeeRow({ employee, index, onChange }: Props) {
  return (
    <tr className="group transition-colors hover:bg-slate-50">
      {/* Number */}
      <td className="sticky left-0 z-30 w-14 min-w-14 border-b border-slate-200 bg-white px-3 py-3 text-center group-hover:bg-slate-50">
        <span className="text-sm font-medium text-slate-400">{index + 1}</span>
      </td>

      {/* Employee */}
      <td className="sticky left-14 z-30 w-64 min-w-64 border-b border-slate-200 bg-white px-4 py-3 shadow-[2px_0_6px_rgba(0,0,0,0.04)] group-hover:bg-slate-50">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-sm font-semibold text-slate-600">
            {employee.avatar ? (
              <img
                src={employee.avatar}
                alt={employee.name}
                className="h-full w-full object-cover"
              />
            ) : (
              employee.name?.charAt(0).toUpperCase() || '?'
            )}
          </div>

          {/* Employee information */}
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-slate-800">{employee.name}</div>

            <div className="mt-0.5 truncate text-xs text-slate-500">{employee.employeeId}</div>
          </div>
        </div>
      </td>

      {/* Monday */}
      <td className="w-16 min-w-16 border-b border-slate-200 px-1 py-2 text-center">
        <RosterCell
          value={employee.roster.mon}
          onChange={(value) => onChange(employee._id, 'mon', value)}
        />
      </td>

      {/* Tuesday */}
      <td className="w-16 min-w-16 border-b border-slate-200 px-1 py-2 text-center">
        <RosterCell
          value={employee.roster.tue}
          onChange={(value) => onChange(employee._id, 'tue', value)}
        />
      </td>

      {/* Wednesday */}
      <td className="w-16 min-w-16 border-b border-slate-200 px-1 py-2 text-center">
        <RosterCell
          value={employee.roster.wed}
          onChange={(value) => onChange(employee._id, 'wed', value)}
        />
      </td>

      {/* Thursday */}
      <td className="w-16 min-w-16 border-b border-slate-200 px-1 py-2 text-center">
        <RosterCell
          value={employee.roster.thu}
          onChange={(value) => onChange(employee._id, 'thu', value)}
        />
      </td>

      {/* Friday */}
      <td className="w-16 min-w-16 border-b border-slate-200 px-1 py-2 text-center">
        <RosterCell
          value={employee.roster.fri}
          onChange={(value) => onChange(employee._id, 'fri', value)}
        />
      </td>

      {/* Saturday */}
      <td className="w-16 min-w-16 border-b border-slate-200 px-1 py-2 text-center">
        <RosterCell
          value={employee.roster.sat}
          onChange={(value) => onChange(employee._id, 'sat', value)}
        />
      </td>

      {/* Sunday */}
      <td className="w-16 min-w-16 border-b border-slate-200 px-1 py-2 text-center">
        <RosterCell
          value={employee.roster.sun}
          onChange={(value) => onChange(employee._id, 'sun', value)}
        />
      </td>
    </tr>
  );
}
