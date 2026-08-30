// 'use client';

// import { Tabs } from 'antd';
// import {
//   AuditOutlined,
//   FileDoneOutlined,
//   HistoryOutlined,
//   MailOutlined,
//   SafetyCertificateOutlined,
//   ScheduleOutlined,
// } from '@ant-design/icons';

// import ApprovalStatus from './ApprovalStatus';
// import AuthForm from './form/AuthForm';
// import Mails from './Mails';
// import Billing from './Billing';
// import History from './History';
// import Itinerary from './Itinerary';
// import Notes from './Notes';

// import { Booking } from '@/components/user/booking/types';

// interface AuthTabsProps {
//   booking: Booking;
// }

// export default function AuthTabs({ booking }: AuthTabsProps) {
//   const items = [
//     {
//       key: 'authorization',
//       label: (
//         <span>
//           <SafetyCertificateOutlined /> AuthForm
//         </span>
//       ),
//       children: <AuthForm booking={booking} />,
//     },
//     {
//       key: 'approval',
//       label: (
//         <span>
//           <FileDoneOutlined /> Approval
//         </span>
//       ),
//       children: <ApprovalStatus booking={booking} />,
//     },
//     {
//       key: 'mail',
//       label: (
//         <span>
//           <MailOutlined /> Mail
//         </span>
//       ),
//       children: <Mails booking={booking} />,
//     },
//     {
//       key: 'billing',
//       label: (
//         <span>
//           <AuditOutlined /> Billing
//         </span>
//       ),
//       children: <Billing booking={booking} />,
//     },
//     {
//       key: 'history',
//       label: (
//         <span>
//           <HistoryOutlined /> History
//         </span>
//       ),
//       children: <History booking={booking} />,
//     },
//     {
//       key: 'notes',
//       label: (
//         <span>
//           <HistoryOutlined /> Notes
//         </span>
//       ),
//       children: <Notes booking={booking} />,
//     },
//     {
//       key: 'itinerary',
//       label: (
//         <span className="flex items-center gap-2">
//           <ScheduleOutlined />
//           Itinerary
//         </span>
//       ),
//       children: <Itinerary booking={booking} />,
//     },
//   ];

//   return <Tabs defaultActiveKey="authorization" items={items} size="large" animated />;
// }

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
import Notes from './Notes';

import { Booking } from '@/components/user/booking/types';
import { useAuthStore } from '@/store/authStore';

interface AuthTabsProps {
  booking: Booking;
}

export default function AuthTabs({ booking }: AuthTabsProps) {
  const { user } = useAuthStore();

  /*
  |--------------------------------------------------------------------------
  | User
  |--------------------------------------------------------------------------
  */

  const isAdmin = user?.role === 'admin';

  const permissions: string[] = (user as { permissions?: string[] } | null)?.permissions || [];

  /*
  |--------------------------------------------------------------------------
  | Permission Helper
  |--------------------------------------------------------------------------
  */

  const hasPermission = (permission: string) => {
    return isAdmin || permissions.includes(permission);
  };

  /*
  |--------------------------------------------------------------------------
  | Tab Permissions
  |--------------------------------------------------------------------------
  */

  const canViewAuthForm = hasPermission('booking.authform.view');

  const canViewApproval = hasPermission('booking.authform.approval.view');

  const canViewMail = hasPermission('booking.authform.mail.view');

  const canViewBilling = hasPermission('booking.authform.billing.view');

  const canViewHistory = hasPermission('booking.authform.history.view');

  const canViewNotes = hasPermission('booking.authform.notes.view');

  const canViewItinerary = hasPermission('booking.authform.itinerary.view');

  /*
  |--------------------------------------------------------------------------
  | Tabs
  |--------------------------------------------------------------------------
  */

  const items = [];

  /*
  |--------------------------------------------------------------------------
  | Auth Form
  |--------------------------------------------------------------------------
  */

  if (canViewAuthForm) {
    items.push({
      key: 'authorization',

      label: (
        <span>
          <SafetyCertificateOutlined /> AuthForm
        </span>
      ),

      children: <AuthForm booking={booking} />,
    });
  }

  /*
  |--------------------------------------------------------------------------
  | Approval
  |--------------------------------------------------------------------------
  */

  if (canViewApproval) {
    items.push({
      key: 'approval',

      label: (
        <span>
          <FileDoneOutlined /> Approval
        </span>
      ),

      children: <ApprovalStatus booking={booking} />,
    });
  }

  /*
  |--------------------------------------------------------------------------
  | Mail
  |--------------------------------------------------------------------------
  */

  if (canViewMail) {
    items.push({
      key: 'mail',

      label: (
        <span>
          <MailOutlined /> Mail
        </span>
      ),

      children: <Mails booking={booking} />,
    });
  }

  /*
  |--------------------------------------------------------------------------
  | Billing
  |--------------------------------------------------------------------------
  */

  if (canViewBilling) {
    items.push({
      key: 'billing',

      label: (
        <span>
          <AuditOutlined /> Billing
        </span>
      ),

      children: <Billing booking={booking} />,
    });
  }

  /*
  |--------------------------------------------------------------------------
  | History
  |--------------------------------------------------------------------------
  */

  if (canViewHistory) {
    items.push({
      key: 'history',

      label: (
        <span>
          <HistoryOutlined /> History
        </span>
      ),

      children: <History booking={booking} />,
    });
  }

  /*
  |--------------------------------------------------------------------------
  | Notes
  |--------------------------------------------------------------------------
  */

  if (canViewNotes) {
    items.push({
      key: 'notes',

      label: (
        <span>
          <HistoryOutlined /> Notes
        </span>
      ),

      children: <Notes booking={booking} />,
    });
  }

  /*
  |--------------------------------------------------------------------------
  | Itinerary
  |--------------------------------------------------------------------------
  */

  if (canViewItinerary) {
    items.push({
      key: 'itinerary',

      label: (
        <span className="flex items-center gap-2">
          <ScheduleOutlined />
          Itinerary
        </span>
      ),

      children: <Itinerary booking={booking} />,
    });
  }

  /*
  |--------------------------------------------------------------------------
  | No Permission
  |--------------------------------------------------------------------------
  */

  if (items.length === 0) {
    return null;
  }

  /*
  |--------------------------------------------------------------------------
  | Default Tab
  |--------------------------------------------------------------------------
  */

  const defaultActiveKey = items[0].key;

  return <Tabs defaultActiveKey={defaultActiveKey} items={items} size="large" animated />;
}