'use client';

import { Avatar, Badge, Dropdown, message, type MenuProps } from 'antd';
import {
  BellOutlined,
  DownOutlined,
  LogoutOutlined,
  MenuOutlined,
  UserOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import axios from 'axios';

import { useAuthStore } from '@/store/authStore';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const router = useRouter();

  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      const { data } = await axios.post('/api/auth/logout');

      logout();

      message.success(data.message);

      router.replace('/login');
      router.refresh();
    } catch {
      message.error('Logout failed');
    }
  };

  const items: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'My Profile',
      onClick: () => router.push('/dashboard/profile'),
    },
    {
      key: 'update-profile',
      icon: <SettingOutlined />,
      label: 'Update Profile',
      onClick: () => router.push('/dashboard/profile/edit'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur-xl lg:px-10">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="p-2 text-xl lg:hidden">
          <MenuOutlined />
        </button>

        <div>
          <h1 className="text-lg font-black text-slate-900 lg:text-2xl">User Dashboard</h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Badge count={0} size="small">
          <button className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 transition hover:bg-slate-50">
            <BellOutlined />
          </button>
        </Badge>

        <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
          <button className="flex items-center gap-2 rounded-full border border-slate-200 px-2 py-1.5 hover:bg-slate-50">
            <Avatar size={32} src={user?.avatar || undefined} icon={<UserOutlined />} />

            <span className="hidden text-sm font-medium md:block">{user?.name || 'Admin'}</span>

            <DownOutlined className="text-[10px] text-slate-400" />
          </button>
        </Dropdown>
      </div>
    </header>
  );
}
