'use client';

import { Button, Card, Divider, Empty, Typography } from 'antd';
import {
  FileTextOutlined,
  PlusOutlined,
  UserOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';

import { Booking } from '@/components/admin/booking/types';
import NotePost from './NotePost';

const statusConfig: Record<
  Booking['status'],
  {
    title: string;
    bg: string;
    border: string;
    text: string;
    icon: React.ReactNode;
  }
> = {
  booking_created: {
    title: 'Booking Created',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
    icon: <CheckCircleOutlined className="text-blue-600" />,
  },
  auth_pending: {
    title: 'Authorization Pending',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-800',
    icon: <CheckCircleOutlined className="text-yellow-600" />,
  },
  auth_completed: {
    title: 'Authorization Completed',
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-800',
    icon: <CheckCircleOutlined className="text-green-600" />,
  },
  ticketed: {
    title: 'Ticketed',
    bg: 'bg-cyan-50',
    border: 'border-cyan-200',
    text: 'text-cyan-800',
    icon: <CheckCircleOutlined className="text-cyan-600" />,
  },
  cancelled: {
    title: 'Cancelled',
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
    icon: <CheckCircleOutlined className="text-red-600" />,
  },
  refunded: {
    title: 'Refunded',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-800',
    icon: <CheckCircleOutlined className="text-purple-600" />,
  },
  charge_back: {
    title: 'Charge Back',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-800',
    icon: <CheckCircleOutlined className="text-orange-600" />,
  },
  follow_up: {
    title: 'Follow Up',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    text: 'text-indigo-800',
    icon: <CheckCircleOutlined className="text-indigo-600" />,
  },
  card_charged: {
    title: 'Card Charged',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-800',
    icon: <CheckCircleOutlined className="text-emerald-600" />,
  },
  card_decline: {
    title: 'Card Declined',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    text: 'text-rose-800',
    icon: <CheckCircleOutlined className="text-rose-600" />,
  },
};

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <tr className="border-b border-slate-100 last:border-0">
      <td className="w-28 py-1.5 pr-3 text-xs font-medium text-slate-500 align-top">{label}</td>

      <td className="py-1.5 text-xs font-medium text-slate-800 break-words">{value}</td>
    </tr>
  );
}

interface AuthSidebarProps {
  booking: Booking;
}

export default function AuthSidebar({ booking }: AuthSidebarProps) {
  const status = statusConfig[booking.status];
  return (
    <div className="sticky top-6">
      <Card
        className="rounded-xl shadow-sm"
        styles={{
          body: {
            padding: 16,
          },
        }}
      >
        {/* Query Information */}
        <div>
          <div className="mb-3 flex items-center gap-2">
            <FileTextOutlined className="text-base text-blue-600" />
            <h3 className="m-0 text-sm font-semibold text-slate-800">Booking Information</h3>
          </div>

          <table className="w-full text-xs">
            <tbody>
              <InfoRow
                label="Destination"
                value={`${booking.journey.fromCity} → ${booking.journey.toCity}`}
              />

              <InfoRow
                label="Departure"
                value={new Date(booking.journey.departureDate).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              />

              <InfoRow
                label="Return"
                value={
                  booking.journey.returnDate
                    ? new Date(booking.journey.returnDate).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })
                    : '-'
                }
              />

              <InfoRow
                label="Travel"
                value={new Date(booking.journey.departureDate).toLocaleDateString('en-IN', {
                  month: 'long',
                  year: 'numeric',
                })}
              />

              <InfoRow label="Lead" value={booking.callType || '-'} />

              <InfoRow label="Service" value={booking.service} />

              <InfoRow
                label="Pax"
                value={`${booking.journey.adults} ADT • ${booking.journey.children} CHD • ${booking.journey.infants} INF`}
              />

              <InfoRow label="Sale Type" value={booking.saleType || '-'} />

              <InfoRow label="Status" value={booking.status.replace(/_/g, ' ').toUpperCase()} />

              <InfoRow label="Remark" value={booking.remark || '-'} />
            </tbody>
          </table>
        </div>

        <Divider className="my-4" />

        {/* Customer */}
        <div>
          <div className="mb-3 flex items-center gap-2">
            <UserOutlined className="text-base text-blue-600" />
            <h3 className="m-0 text-sm font-semibold text-slate-800">Customer Information</h3>
          </div>

          <table className="w-full text-xs">
            <tbody>
              <InfoRow
                label="Name"
                value={`${booking.customer.title ? booking.customer.title + ' ' : ''}${booking.customer.name}`}
              />

              <InfoRow label="Phone" value={booking.customer.mobile} />

              <InfoRow label="Email" value={booking.customer.email || '-'} />
            </tbody>
          </table>
        </div>

        <Divider className="my-4" />

        <div className={`rounded-md border p-3 ${status.border} ${status.bg}`}>
          <div className="flex items-start gap-2">
            {status.icon}

            <div>
              <div className={`text-xs font-semibold ${status.text}`}>{status.title}</div>

              <div className="mt-1 text-[11px] text-slate-600">
                Created: {new Date(booking.createdAt).toLocaleDateString('en-IN')}
              </div>

              <div className="text-[11px] text-slate-600">
                Updated: {new Date(booking.updatedAt).toLocaleDateString('en-IN')}
              </div>
            </div>
          </div>
        </div>

        <Divider className="my-4" />

        <NotePost bookingId={booking._id} />
      </Card>
    </div>
  );
}
