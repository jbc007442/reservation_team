'use client';

import { Select } from 'antd';
import StatusBadge from './StatusBadge';
import { statusOptions } from './dummyData';

interface RosterCellProps {
  value: string;
  onChange: (value: string) => void;
}

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
      value={value}
      onChange={onChange}
      options={options}
      variant="borderless"
      suffixIcon={null}
      popupMatchSelectWidth={180}
      optionLabelProp="value"
      getPopupContainer={(trigger) => trigger.parentElement!}
      style={{
        width: '100%',
      }}
      labelRender={({ value }) => (
        <div className="flex justify-center">
          <StatusBadge value={String(value)} />
        </div>
      )}
    />
  );
}
