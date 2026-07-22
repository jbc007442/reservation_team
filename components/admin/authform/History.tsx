'use client';

import React, { useEffect, useState } from 'react';

import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  MailOutlined,
  UserOutlined,
} from '@ant-design/icons';

import { Card, Empty, Spin, Timeline, Typography } from 'antd';

import { Booking } from '@/components/admin/booking/types';

const { Text } = Typography;

interface HistoryProps {
  booking: Booking;
}

interface TimelineItem {
  action: string;
  description: string;
  source: 'system' | 'customer' | 'staff';
  createdAt: string;
  performedBy?: {
    _id: string;
    name: string;
  };
}

export default function History({ booking }: HistoryProps) {
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<TimelineItem[]>([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);

      const res = await fetch(`/api/authform/timeline/${booking._id}`);
      const result = await res.json();

      if (result.success) {
        setHistory(result.data || []);
      }
    } catch (error) {
      console.error('Timeline Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getColor = (item: TimelineItem) => {
    switch (item.action.toLowerCase()) {
      case 'booking approved':
        return 'green';

      case 'authorization form created':
        return 'green';

      case 'authorization email sent':
      case 'email sent':
        return 'blue';

      case 'email opened':
        return 'cyan';

      case 'customer submitted':
        return 'gold';

      default:
        switch (item.source) {
          case 'customer':
            return 'gold';

          case 'staff':
            return 'blue';

          default:
            return 'gray';
        }
    }
  };

  const getIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'booking approved':
        return <CheckCircleOutlined />;

      case 'authorization form created':
        return <CheckCircleOutlined />;

      case 'authorization email sent':
      case 'email sent':
        return <MailOutlined />;

      case 'email opened':
        return <EyeOutlined />;

      case 'customer submitted':
        return <UserOutlined />;

      default:
        return <ClockCircleOutlined />;
    }
  };

  return (
    <Card title="Audit Timeline" size="small" className="shadow-sm">
      {loading ? (
        <div className="flex justify-center py-10">
          <Spin />
        </div>
      ) : history.length === 0 ? (
        <Empty description="No activity found" />
      ) : (
        <Timeline
          items={history.map((item) => ({
            color: getColor(item),
            dot: getIcon(item.action),

            children: (
              <>
                <Text strong>{item.action}</Text>

                {item.description && <div className="text-slate-500 mt-1">{item.description}</div>}

                {item.performedBy && (
                  <div className="text-xs text-slate-500 mt-1">By: {item.performedBy.name}</div>
                )}

                <div className="text-xs text-slate-400 mt-1">
                  {new Date(item.createdAt).toLocaleString()}
                </div>
              </>
            ),
          }))}
        />
      )}
    </Card>
  );
}
