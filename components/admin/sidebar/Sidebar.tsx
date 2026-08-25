'use client';

import {
  BarChartOutlined,
  CalendarOutlined,
  CloseOutlined,
  DashboardOutlined,
  DownOutlined,
  RightOutlined,
  RocketOutlined,
  SafetyCertificateOutlined,
  ScheduleOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const menus = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: DashboardOutlined,
  },
  {
    name: 'Users',
    icon: TeamOutlined,
    children: [
      {
        name: 'All Users',
        href: '/admin/users',
      },
      {
        name: 'Manage Users',
        href: '/admin/users/manage',
      },
    ],
  },
  {
    name: 'Attendance',
    icon: CalendarOutlined,
    children: [
      {
        name: 'Roster Management',
        href: '/admin/attendance/roster',
      },
      {
        name: 'Daily Attendance',
        href: '/admin/attendance',
      },
      {
        name: 'Leave Management',
        href: '/admin/attendance/leaves',
      },
      {
        name: 'Holiday Management',
        href: '/admin/attendance/holidays',
      },
    ],
  },
  {
    name: 'Booking',
    icon: ScheduleOutlined,
    children: [
      {
        name: 'Query',
        href: '/admin/booking',
      },
      {
        name: 'Auth Form',
        href: '/admin/booking/authform',
      },
      {
        name: 'DPR',
        href: '/admin/booking/dpr',
      },
    ],
  },
  {
    name: 'Reports',
    icon: BarChartOutlined,
    children: [
      {
        name: 'Booking Report',
        href: '/admin/reports',
      },
      {
        name: 'Attendance Report',
        href: '/admin/reports/attendance',
      },
      {
        name: 'Break Report',
        href: '/admin/reports/break',
      },
    ],
  },
  {
    name: 'Roles & Permissions',
    icon: SafetyCertificateOutlined,
    children: [
      {
        name: 'Roles',
        href: '/admin/roles',
      },
      {
        name: 'Permissions',
        href: '/admin/permissions',
      },
    ],
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const [openMenu, setOpenMenu] = useState('Users');

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-72 flex-col border-r border-slate-100 bg-white shadow-xl transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex h-20 items-center justify-between border-b border-slate-100 bg-white px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-sky-500 to-cyan-500 text-lg text-white shadow-xl">
              <RocketOutlined />
            </div>

            <div>
              <h1 className="text-lg font-black tracking-tight text-slate-800">
                Travel<span className="text-blue-600">CRM</span>
              </h1>

              <p className="text-xs font-medium text-slate-500">Admin Portal</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 lg:hidden"
          >
            <CloseOutlined />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-6">
          {menus.map((item) => {
            const Icon = item.icon;

            // ==========================
            // Parent Menu
            // ==========================
            if ('children' in item && item.children) {
              const expanded = openMenu === item.name;

              const active = item.children.some((child) => pathname.startsWith(child.href));

              return (
                <div key={item.name}>
                  <button
                    onClick={() => setOpenMenu(expanded ? '' : item.name)}
                    className={`group flex w-full items-center justify-between rounded-2xl px-4 py-3.5 font-semibold transition-all duration-200 ${
                      active
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <Icon
                        className={`text-lg transition ${
                          active ? 'text-white' : 'text-slate-500 group-hover:text-slate-700'
                        }`}
                      />

                      <span className={active ? 'text-white' : ''}>{item.name}</span>
                    </div>

                    <div className={`transition ${active ? 'text-white' : 'text-slate-400'}`}>
                      {expanded ? <DownOutlined /> : <RightOutlined />}
                    </div>
                  </button>

                  {expanded && (
                    <div className="ml-6 mt-3 space-y-1 border-l-2 border-slate-200 pl-4">
                      {item.children.map((child) => {
                        const childActive = pathname === child.href;

                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={onClose}
                            className={`group flex items-center gap-3 rounded-xl px-4 py-2.5 transition-all duration-200 ${
                              childActive
                                ? 'bg-blue-50 font-semibold text-blue-700'
                                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                            }`}
                          >
                            <span
                              className={`h-2 w-2 rounded-full transition ${
                                childActive
                                  ? 'bg-blue-600'
                                  : 'bg-slate-300 group-hover:bg-slate-500'
                              }`}
                            />

                            <span className={`transition ${childActive ? 'text-blue-700' : ''}`}>
                              {child.name}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            // ==========================
            // Single Menu
            // ==========================
            const active =
              item.href === '/admin' ? pathname === item.href : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`group flex items-center gap-4 rounded-2xl px-4 py-3.5 font-semibold transition-all duration-200 ${
                  active
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon
                  className={`text-lg transition ${
                    active ? 'text-white' : 'text-slate-500 group-hover:text-slate-700'
                  }`}
                />

                <span className={active ? 'text-white' : ''}>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
