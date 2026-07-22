'use client';

import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  MailOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Card, Timeline, Typography } from 'antd';
import { Booking } from '@/components/user/booking/types';

const { Text } = Typography;

interface HistoryProps {
  booking: Booking;
}


export default function History({ booking }: HistoryProps) {
  return (
    <Card title="Audit Timeline" size="small" className="shadow-sm">
      <Timeline
        items={[
          {
            color: 'green',
            icon: <CheckCircleOutlined />,
            children: (
              <>
                <Text strong>Authorization Form Created</Text>

                <div className="text-slate-500">Admin • 12 Jul 2026 10:20 AM</div>
              </>
            ),
          },
          {
            color: 'blue',
            icon: <MailOutlined />,
            children: (
              <>
                <Text strong>Email Sent</Text>

                <div className="text-slate-500">Authorization email sent to customer.</div>

                <div className="text-xs text-slate-400">12 Jul 2026 10:25 AM</div>
              </>
            ),
          },
          {
            color: 'cyan',
            icon: <EyeOutlined />,
            children: (
              <>
                <Text strong>Email Opened</Text>

                <div className="text-slate-500">Customer viewed the authorization form.</div>

                <div className="text-xs text-slate-400">12 Jul 2026 10:31 AM</div>
              </>
            ),
          },
          {
            color: 'gold',
            icon: <UserOutlined />,
            children: (
              <>
                <Text strong>Customer Submitted</Text>

                <div className="text-slate-500">Authorization form submitted successfully.</div>

                <div className="text-xs text-slate-400">12 Jul 2026 10:35 AM</div>
              </>
            ),
          },
          {
            color: 'green',
            icon: <CheckCircleOutlined />,
            children: (
              <>
                <Text strong>Booking Approved</Text>

                <div className="text-slate-500">Booking approved by operations team.</div>

                <div className="text-xs text-slate-400">12 Jul 2026 10:40 AM</div>
              </>
            ),
          },
          {
            color: 'gray',
            icon: <ClockCircleOutlined />,
            children: (
              <>
                <Text strong>Waiting for Ticketing</Text>

                <div className="text-slate-500">Ticket generation is pending.</div>
              </>
            ),
          },
        ]}
      />
    </Card>
  );
}
