'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  DashboardOutlined,
  CalendarOutlined,
  ScheduleOutlined,
  CloseOutlined,
  RocketOutlined,
  DownOutlined,
  RightOutlined,
} from '@ant-design/icons';


const menus = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: DashboardOutlined,
  },
  {
    name: 'Attendance',
    icon: CalendarOutlined,
    children: [
      {
        name: 'Mark Attendance',
        href: '/dashboard/attendance',
      },
      {
        name: 'My Attendance',
        href: '/dashboard/attendance/history',
      },
      {
        name: 'My Roster',
        href: '/dashboard/attendance/roster',
      },
      {
        name: 'Apply Leave',
        href: '/dashboard/attendance/leave',
      },
      {
        name: 'Holidays',
        href: '/dashboard/attendance/holidays',
      },
    ],
  },
  {
    name: 'Booking',
    icon: ScheduleOutlined,
    children: [
      {
        name: 'Query',
        href: '/dashboard/booking',
      },
      {
        name: 'Auth Form',
        href: '/dashboard/booking/authform',
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
  const [openMenus, setOpenMenus] = useState(['Attendance']);

  const toggleMenu = (name: string) => {
    setOpenMenus((prev) =>
      prev.includes(name) ? prev.filter((m) => m !== name) : [...prev, name]
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
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

              <p className="text-xs text-slate-500">User Portal</p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-500 lg:hidden">
            <CloseOutlined />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-6">
          {menus.map((item) => {
            const Icon = item.icon;

            if (item.children) {
              const isActive = item.children.some((child) => pathname.startsWith(child.href));

              return (
                <div key={item.name}>
                  <button
                    type="button"
                    onClick={() => toggleMenu(item.name)}
                    className={`flex w-full items-center justify-between rounded-xl px-4 py-3 font-medium transition ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <Icon className="text-lg" />
                      <span>{item.name}</span>
                    </div>

                    {openMenus.includes(item.name) ? <DownOutlined /> : <RightOutlined />}
                  </button>
                  {openMenus.includes(item.name) && (
                    <div className="ml-10 mt-2 space-y-1">
                      {item.children.map((child) => {
                        const active = pathname === child.href;

                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={onClose}
                            className={`block rounded-lg px-3 py-2 text-sm transition ${
                              active
                                ? 'bg-blue-100 font-semibold text-blue-600'
                                : 'text-slate-500 hover:bg-slate-100'
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

            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`group flex items-center gap-4 rounded-xl px-4 py-3 font-medium transition-all ${
                  active
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white'
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
