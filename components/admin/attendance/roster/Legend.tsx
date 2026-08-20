'use client';

import StatusBadge from './StatusBadge';

const items = [
  {
    value: 'P',
    title: 'Present / Working Day',
  },
  {
    value: 'WO',
    title: 'Weekly Off',
  },
  {
    value: 'L',
    title: 'Approved Leave',
  },
  {
    value: 'H',
    title: 'Holiday',
  },
  {
    value: 'HD',
    title: 'Half Day',
  },
];

export default function Legend() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-slate-800">Roster Legend</h3>

        <p className="mt-1 text-xs text-slate-500">Status codes used in the weekly roster</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {items.map((item) => (
          <div
            key={item.value}
            className="
              flex min-h-[52px]
              items-center
              gap-3
              rounded-lg
              border border-slate-100
              bg-slate-50
              px-3
              py-2
            "
          >
            {/* Status */}
            <div className="flex w-10 shrink-0 justify-center">
              <StatusBadge value={item.value} />
            </div>

            {/* Description */}
            <div className="min-w-0 flex justify-center">
              <p className="text-sm font-medium leading-5 text-slate-700">{item.title}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
