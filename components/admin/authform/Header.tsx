'use client';
import { useState } from 'react';
import SendEmailModal from './SendEmailModal';

import {
  ArrowLeftOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  MailOutlined,
  PhoneOutlined,
  UserOutlined,
  WhatsAppOutlined,
  FormOutlined,
} from '@ant-design/icons';
import { Button, Tag, Tooltip, Typography } from 'antd';
import { useRouter } from 'next/navigation';

import { Booking } from '@/components/admin/booking/types';

const { Title, Text } = Typography;

interface HeaderProps {
  booking: Booking;
}

export default function Header({ booking }: HeaderProps) {
  const router = useRouter();
  const [emailOpen, setEmailOpen] = useState(false);

  return (
    <>
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          {/* Left */}
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <Button shape="circle" icon={<ArrowLeftOutlined />} onClick={() => router.back()} />

              <div>
                <Title level={3} style={{ margin: 0 }}>
                  Authorization Form
                </Title>

                <Text type="secondary">Booking #{booking.bookingNo}</Text>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <Tag color="blue">
                {booking.journey.fromCity} → {booking.journey.toCity}
              </Tag>

              <Tag icon={<CalendarOutlined />}>
                {new Date(booking.journey.departureDate).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}

                {booking.journey.returnDate &&
                  ` - ${new Date(booking.journey.returnDate).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}`}
              </Tag>

              <Tag icon={<UserOutlined />}>
                {booking.journey.adults} Adult
                {booking.journey.adults > 1 ? 's' : ''}
                {booking.journey.children > 0 && ` • ${booking.journey.children} Child`}
                {booking.journey.infants > 0 && ` • ${booking.journey.infants} Infant`}
              </Tag>

              <Tag color="cyan">{booking.service}</Tag>

              {/* <Tag icon={<EnvironmentOutlined />}>{booking.createdBy?.name || 'N/A'}</Tag> */}
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-x-8 gap-y-3">
              <div className="flex items-center gap-2">
                <PhoneOutlined />
                <Text>{booking.customer.mobile}</Text>
              </div>

              <div className="flex items-center gap-2">
                <MailOutlined />
                <Text>{booking.customer.email || '-'}</Text>
              </div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm">
            <div className="flex">
              <ToolbarButton
                icon={<MailOutlined />}
                tooltip="Send Email"
                onClick={() => setEmailOpen(true)}
              />

              <ToolbarButton
                icon={<WhatsAppOutlined />}
                tooltip="Send WhatsApp"
                href={`https://wa.me/${booking.customer.mobile.replace(/\D/g, '')}`}
              />

              <ToolbarButton
                icon={<FormOutlined />}
                tooltip="Approval Form"
                last
                onClick={() => {
                  // Open approval form dialog/page
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <SendEmailModal
        open={emailOpen}
        onClose={() => setEmailOpen(false)}
        bookingNo={booking.bookingNo}
        email={booking.customer.email ?? ''}
        customerName={booking.customer.name}
      />
    </>
  );
}

function ToolbarButton({
  icon,
  tooltip,
  href,
  onClick,
  last = false,
}: {
  icon: React.ReactNode;
  tooltip: string;
  href?: string;
  onClick?: () => void;
  last?: boolean;
}) {
  const className = `flex h-14 w-14 items-center justify-center text-xl text-slate-700 transition-all hover:bg-blue-50 hover:text-blue-600 ${
    !last ? 'border-r border-slate-300' : ''
  }`;

  if (href) {
    return (
      <Tooltip title={tooltip}>
        <a
          href={href}
          target={href.startsWith('http') ? '_blank' : undefined}
          rel="noopener noreferrer"
          className={className}
        >
          {icon}
        </a>
      </Tooltip>
    );
  }

  return (
    <Tooltip title={tooltip}>
      <button onClick={onClick} className={className}>
        {icon}
      </button>
    </Tooltip>
  );
}