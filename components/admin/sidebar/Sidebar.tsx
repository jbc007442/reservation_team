'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  DashboardOutlined,
  CalendarOutlined,
  TeamOutlined,
  CloseOutlined,
  RocketOutlined,
  DownOutlined,
  RightOutlined,
  ScheduleOutlined,
} from '@ant-design/icons';

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
      {
        name: 'Attendance Reports',
        href: '/admin/attendance/reports',
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
        className={`fixed left-0 top-0 z-50 flex h-screen w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex h-20 items-center justify-between border-b border-slate-100 px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg">
              <RocketOutlined />
            </div>

            <div>
              <h1 className="text-lg font-black tracking-tight">
                Travel<span className="text-blue-600">CRM</span>
              </h1>

              <p className="text-xs text-slate-500">Admin Portal</p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-500 lg:hidden">
            <CloseOutlined />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
          {menus.map((item) => {
            const Icon = item.icon;

            // Menu with children
            if ('children' in item) {
              const expanded = openMenu === item.name;

              const active = item.children?.some((child) => pathname.startsWith(child.href)) ?? false;

              return (
                <div key={item.name}>
                  <button
                    onClick={() => setOpenMenu(expanded ? '' : item.name)}
                    className={`flex w-full items-center justify-between rounded-xl px-4 py-3 font-medium transition ${
                      active
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <Icon className="text-lg" />
                      <span>{item.name}</span>
                    </div>

                    {expanded ? <DownOutlined /> : <RightOutlined />}
                  </button>

                  {expanded && (
                    <div className="mt-2 ml-6 space-y-1 border-l border-slate-200 pl-4">
                      {item.children?.map((child) => {
                        const childActive = pathname === child.href;

                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={onClose}
                            className={`block rounded-lg px-3 py-2 text-sm transition ${
                              childActive
                                ? 'bg-blue-50 font-semibold text-blue-600'
                                : 'text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            {child.name}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            // Normal Menu
            const active =
              item.href === '/admin' ? pathname === item.href : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-4 rounded-xl px-4 py-3 font-medium transition ${
                  active
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="text-lg" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
