import {
  TeamOutlined,
  CalendarOutlined,
  DollarOutlined,
  EnvironmentOutlined,
  CarOutlined,
  GlobalOutlined,
} from '@ant-design/icons';

import type { StatCard } from '@/components/shared/cards/StatsCards';

export const stats: StatCard[] = [
  {
    title: 'Total Customers',
    value: '12,486',
    change: '+12.8%',
    icon: <TeamOutlined />,
    color: '#1677ff',
  },
  {
    title: 'Active Bookings',
    value: '856',
    change: '+8.4%',
    icon: <CalendarOutlined />,
    color: '#52c41a',
  },
  {
    title: 'Revenue',
    value: '₹48.6L',
    change: '+16.2%',
    icon: <DollarOutlined />,
    color: '#722ed1',
  },
  {
    title: 'Tour Packages',
    value: '142',
    change: '+6',
    icon: <EnvironmentOutlined />,
    color: '#fa8c16',
  },
  {
    title: 'Vehicle Bookings',
    value: '318',
    change: '+10%',
    icon: <CarOutlined />,
    color: '#13c2c2',
  },
  {
    title: 'International Tours',
    value: '68',
    change: '+18%',
    icon: <GlobalOutlined />,
    color: '#eb2f96',
  },
];