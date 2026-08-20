// 'use client';

// import { Dispatch, SetStateAction } from 'react';
// import dayjs, { Dayjs } from 'dayjs';
// import weekday from 'dayjs/plugin/weekday';
// import weekOfYear from 'dayjs/plugin/weekOfYear';
// import updateLocale from 'dayjs/plugin/updateLocale';

// import { DatePicker, Input, Space } from 'antd';
// import { CalendarOutlined, LeftOutlined, RightOutlined, SearchOutlined } from '@ant-design/icons';

// dayjs.extend(weekday);
// dayjs.extend(weekOfYear);
// dayjs.extend(updateLocale);

// dayjs.updateLocale('en', {
//   weekStart: 1,
// });

// interface RosterControlsProps {
//   currentWeek: Dayjs;
//   setCurrentWeek: Dispatch<SetStateAction<Dayjs>>;
// }

// export default function RosterControls({ currentWeek, setCurrentWeek }: RosterControlsProps) {
//   const startOfWeek = currentWeek.startOf('week');
//   const endOfWeek = currentWeek.endOf('week');

//   return (
//     <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
//       {/* Top */}
//       <div>
//         <h1 className="text-2xl font-bold text-slate-900">Weekly Roster</h1>

//         <p className="mt-1 text-sm text-slate-500">Assign shifts, leave and weekly offs.</p>
//       </div>

//       {/* Week Navigation */}
//       <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50 px-5 py-4">
//         <button
//           type="button"
//           onClick={() => setCurrentWeek(currentWeek.subtract(1, 'week'))}
//           className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100"
//         >
//           <LeftOutlined />
//         </button>

//         <div className="text-center">
//           <div className="text-lg font-semibold text-slate-800">
//             {startOfWeek.format('DD MMM YYYY')} – {endOfWeek.format('DD MMM YYYY')}
//           </div>

//           <div className="mt-1 text-sm text-slate-500">Week {currentWeek.week()}</div>
//         </div>

//         <button
//           type="button"
//           onClick={() => setCurrentWeek(currentWeek.add(1, 'week'))}
//           className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100"
//         >
//           <RightOutlined />
//         </button>
//       </div>

//       {/* Filters */}
//       <div className="mt-6 flex flex-wrap items-center gap-4">
//         <Space wrap size="middle">
//           <DatePicker
//             picker="week"
//             size="large"
//             value={currentWeek}
//             onChange={(date) => {
//               if (date) {
//                 setCurrentWeek(date);
//               }
//             }}
//             suffixIcon={<CalendarOutlined />}
//           />

//           <Input
//             className="w-72"
//             size="large"
//             placeholder="Search employee..."
//             prefix={<SearchOutlined />}
//           />
//         </Space>
//       </div>
//     </div>
//   );
// }

'use client';

import { Dispatch, SetStateAction } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import weekday from 'dayjs/plugin/weekday';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import updateLocale from 'dayjs/plugin/updateLocale';

import { DatePicker, Input, Space } from 'antd';
import { CalendarOutlined, LeftOutlined, RightOutlined, SearchOutlined } from '@ant-design/icons';

dayjs.extend(weekday);
dayjs.extend(weekOfYear);
dayjs.extend(updateLocale);

dayjs.updateLocale('en', {
  weekStart: 1,
});

interface RosterControlsProps {
  currentWeek: Dayjs;
  setCurrentWeek: Dispatch<SetStateAction<Dayjs>>;
  searchTerm: string;
  setSearchTerm: Dispatch<SetStateAction<string>>;
}

export default function RosterControls({
  currentWeek,
  setCurrentWeek,
  searchTerm,
  setSearchTerm,
}: RosterControlsProps) {
  const startOfWeek = currentWeek.startOf('week');
  const endOfWeek = currentWeek.endOf('week');

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Weekly Roster</h1>

        <p className="mt-1 text-sm text-slate-500">Assign shifts, leave and weekly offs.</p>
      </div>

      {/* Week Navigation */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50 px-5 py-4">
        <button
          type="button"
          onClick={() => setCurrentWeek(currentWeek.subtract(1, 'week'))}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100"
        >
          <LeftOutlined />
        </button>

        <div className="text-center">
          <div className="text-lg font-semibold text-slate-800">
            {startOfWeek.format('DD MMM YYYY')} – {endOfWeek.format('DD MMM YYYY')}
          </div>

          <div className="mt-1 text-sm text-slate-500">Week {currentWeek.week()}</div>
        </div>

        <button
          type="button"
          onClick={() => setCurrentWeek(currentWeek.add(1, 'week'))}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100"
        >
          <RightOutlined />
        </button>
      </div>

      {/* Filters */}
      <div className="mt-6">
        <Space wrap size="middle">
          <DatePicker
            picker="week"
            size="large"
            value={currentWeek}
            onChange={(date) => {
              if (date) {
                setCurrentWeek(date);
              }
            }}
            suffixIcon={<CalendarOutlined />}
          />

          <Input
            className="w-72"
            size="large"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search employee..."
            prefix={<SearchOutlined />}
            allowClear
          />
        </Space>
      </div>
    </div>
  );
}