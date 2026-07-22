'use client';

import { Tabs } from 'antd';
import {
  AuditOutlined,
  FileDoneOutlined,
  HistoryOutlined,
  MailOutlined,
  SafetyCertificateOutlined,
  ScheduleOutlined,
} from '@ant-design/icons';

import ApprovalStatus from './ApprovalStatus';
import AuthForm from './form/AuthForm';
import Mails from './Mails';
import Billing from './Billing';
import History from './History';
import Itinerary from './Itinerary';

import { Booking } from '@/components/user/booking/types';

interface AuthTabsProps {
  booking: Booking;
}

export default function AuthTabs({ booking }: AuthTabsProps) {
  const items = [
    {
      key: 'authorization',
      label: (
        <span>
          <SafetyCertificateOutlined /> Authorization Form
        </span>
      ),
      children: <AuthForm booking={booking} />,
    },
    {
      key: 'approval',
      label: (
        <span>
          <FileDoneOutlined /> Approval
        </span>
      ),
      children: <ApprovalStatus booking={booking} />,
    },
    {
      key: 'mail',
      label: (
        <span>
          <MailOutlined /> Mail
        </span>
      ),
      children: <Mails booking={booking} />,
    },
    {
      key: 'billing',
      label: (
        <span>
          <AuditOutlined /> Billing
        </span>
      ),
      children: <Billing booking={booking} />,
    },
    {
      key: 'history',
      label: (
        <span>
          <HistoryOutlined /> History
        </span>
      ),
      children: <History booking={booking} />,
    },
    {
      key: 'notes',
      label: (
        <span>
          <HistoryOutlined /> Notes
        </span>
      ),
      children: <div>Note Section</div>,
    },
    {
      key: 'itinerary',
      label: (
        <span className="flex items-center gap-2">
          <ScheduleOutlined />
          Itinerary
        </span>
      ),
      children: <Itinerary booking={booking} />,
    },
  ];

  return <Tabs defaultActiveKey="authorization" items={items} size="large" animated />;
}
