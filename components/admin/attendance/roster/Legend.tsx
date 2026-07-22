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
      <h3 className="mb-4 text-base font-semibold">Roster Legend</h3>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {items.map((item) => (
          <div
            key={item.value}
            className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3"
          >
            <StatusBadge value={item.value} />

            <div>
              <p className="font-medium text-slate-800">{item.value}</p>

              <p className="text-xs text-slate-500">{item.title}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
