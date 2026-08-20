'use client';

import { Select } from 'antd';
import StatusBadge from './StatusBadge';

interface RosterCellProps {
  value: string;
  onChange: (value: string) => void;
}

const statusOptions = [
  { value: 'P', label: 'Present' },
  { value: 'A', label: 'Absent' },
  { value: 'L', label: 'Leave' },
  { value: 'WO', label: 'Weekly Off' },
  { value: 'H', label: 'Holiday' },
  { value: 'HD', label: 'Half Day' },
];

const options = statusOptions.map((status) => ({
  value: status.value,
  label: (
    <div className="flex items-center gap-2 py-1">
      <StatusBadge value={status.value} />
      <span>{status.label}</span>
    </div>
  ),
}));

export default function RosterCell({ value, onChange }: RosterCellProps) {
  return (
    <Select
      value={value || undefined}
      onChange={onChange}
      options={options}
      variant="borderless"
      suffixIcon={null}
      popupMatchSelectWidth={180}
      optionLabelProp="value"
      placeholder="-"
      getPopupContainer={(trigger) => trigger.parentElement!}
      style={{
        width: '100%',
      }}
      labelRender={({ value }) => (
        <div className="flex justify-center">
          {value ? (
            <StatusBadge value={String(value)} />
          ) : (
            <span className="text-slate-400">-</span>
          )}
        </div>
      )}
    />
  );
}
