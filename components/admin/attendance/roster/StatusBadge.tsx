'use client';

interface StatusBadgeProps {
  value: string;
}

const statusConfig: Record<
  string,
  {
    label: string;
    className: string;
  }
> = {
  P: {
    label: 'Present',
    className: 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100',
  },

  WO: {
    label: 'Weekly Off',
    className: 'border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100',
  },

  L: {
    label: 'Leave',
    className: 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100',
  },

  H: {
    label: 'Holiday',
    className: 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100',
  },

  HD: {
    label: 'Half Day',
    className: 'border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100',
  },

  A: {
    label: 'Absent',
    className: 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100',
  },

  OD: {
    label: 'On Duty',
    className: 'border-cyan-200 bg-cyan-50 text-cyan-700 hover:bg-cyan-100',
  },

  WFH: {
    label: 'Work From Home',
    className: 'border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100',
  },
};

export default function StatusBadge({ value }: StatusBadgeProps) {
  const status = statusConfig[value];

  if (!status) {
    return (
      <span className="inline-flex h-6 min-w-[42px] items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-2 text-xs font-medium text-slate-700">
        {value}
      </span>
    );
  }

  return (
    <span
      title={status.label}
      className={`inline-flex h-6 min-w-[42px] cursor-pointer items-center justify-center rounded-full border px-2 text-xs font-semibold transition-colors duration-200 ${status.className}`}
    >
      {value}
    </span>
  );
}
