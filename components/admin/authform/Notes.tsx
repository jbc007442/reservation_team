'use client';

import { useEffect, useState } from 'react';
import { Timeline, Card, Spin, Empty } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';

import { Booking } from '@/components/admin/booking/types';

interface Note {
  _id?: string;
  title?: string;
  note: string;
  type: string;
  visibility: string;
  isPinned: boolean;
  isResolved: boolean;
  createdAt: string;
  addedBy?: {
    name: string;
    email: string;
  };
}

interface NotesProps {
  booking: Booking;
}

export default function Notes({ booking }: NotesProps) {
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    fetchNotes();
  }, [booking._id]);

  const fetchNotes = async () => {
    try {
      const res = await fetch(`/api/authform/booking/${booking._id}`);
      const result = await res.json();
      console.log(JSON.stringify(result.data.notes[0], null, 2));

      if (res.ok) {
        setNotes(result.data.notes || []);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Spin />;
  }

  if (!notes.length) {
    return <Empty description="No notes found" />;
  }

  return (
    <Card>
      <Timeline
        items={notes.map((item) => ({
          dot: <ClockCircleOutlined />,
          children: (
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1">
                <div className="font-semibold text-sm">{item.title || 'Note'}</div>

                <div className="mt-1 text-gray-700">{item.note}</div>

                <div className="mt-2 text-xs text-gray-500">
                  {new Date(item.createdAt).toLocaleString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>

              <div className="min-w-[180px] text-right">
                <div className="font-medium text-slate-800">{item.addedBy?.name || 'System'}</div>

                <div className="text-xs text-slate-500">{item.addedBy?.email}</div>
              </div>
            </div>
          ),
        }))}
      />
    </Card>
  );
}
