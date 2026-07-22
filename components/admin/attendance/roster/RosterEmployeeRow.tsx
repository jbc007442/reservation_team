'use client';

import RosterCell from './RosterCell';

interface Employee {
  id: string;
  name: string;
  department: string;
  roster: {
    mon: string;
    tue: string;
    wed: string;
    thu: string;
    fri: string;
    sat: string;
    sun: string;
  };
}

interface Props {
  employee: Employee;
  onChange: (
    employeeId: string,
    day: 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun',
    value: string
  ) => void;
}

export default function RosterEmployeeRow({ employee, onChange }: Props) {
  return (
    <tr className="transition-colors hover:bg-slate-50">
      {/* Employee */}
      <td className="sticky left-0 z-30 w-52 min-w-52 border-b border-slate-200 bg-white px-4 py-3 shadow-[2px_0_6px_rgba(0,0,0,0.04)]">
        <div className="truncate font-medium text-slate-800">{employee.name}</div>

        <div className="mt-1 text-xs text-slate-500">{employee.id}</div>
      </td>

      {/* Department */}
      <td className="sticky left-52 z-20 w-32 min-w-32 border-b border-slate-200 bg-white px-3 py-3 text-center shadow-[2px_0_6px_rgba(0,0,0,0.03)]">
        <span className="inline-flex whitespace-nowrap rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
          {employee.department}
        </span>
      </td>

      {/* Monday */}
      <td className="w-16 min-w-16 border-b border-slate-200 px-1 py-2 text-center">
        <RosterCell
          value={employee.roster.mon}
          onChange={(value) => onChange(employee.id, 'mon', value)}
        />
      </td>

      {/* Tuesday */}
      <td className="w-16 min-w-16 border-b border-slate-200 px-1 py-2 text-center">
        <RosterCell
          value={employee.roster.tue}
          onChange={(value) => onChange(employee.id, 'tue', value)}
        />
      </td>

      {/* Wednesday */}
      <td className="w-16 min-w-16 border-b border-slate-200 px-1 py-2 text-center">
        <RosterCell
          value={employee.roster.wed}
          onChange={(value) => onChange(employee.id, 'wed', value)}
        />
      </td>

      {/* Thursday */}
      <td className="w-16 min-w-16 border-b border-slate-200 px-1 py-2 text-center">
        <RosterCell
          value={employee.roster.thu}
          onChange={(value) => onChange(employee.id, 'thu', value)}
        />
      </td>

      {/* Friday */}
      <td className="w-16 min-w-16 border-b border-slate-200 px-1 py-2 text-center">
        <RosterCell
          value={employee.roster.fri}
          onChange={(value) => onChange(employee.id, 'fri', value)}
        />
      </td>

      {/* Saturday */}
      <td className="w-16 min-w-16 border-b border-slate-200 px-1 py-2 text-center">
        <RosterCell
          value={employee.roster.sat}
          onChange={(value) => onChange(employee.id, 'sat', value)}
        />
      </td>

      {/* Sunday */}
      <td className="w-16 min-w-16 border-b border-slate-200 px-1 py-2 text-center">
        <RosterCell
          value={employee.roster.sun}
          onChange={(value) => onChange(employee.id, 'sun', value)}
        />
      </td>
    </tr>
  );
}
