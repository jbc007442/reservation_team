'use client';

import { useEffect, useState } from 'react';
import { Timeline, Card, Spin, Empty, Button, Tooltip } from 'antd';
import { ClockCircleOutlined, DownloadOutlined } from '@ant-design/icons';

import { Booking } from '@/components/admin/booking/types';

interface Attachment {
  fileName: string;
  fileUrl: string;
  mimeType: string;
  fileSize: number;
}

interface Note {
  _id?: string;
  title?: string;
  note: string;
  type: string;
  visibility: string;
  isPinned: boolean;
  isResolved: boolean;
  createdAt: string;
  attachments?: Attachment[];
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
          icon: <ClockCircleOutlined />,
          content: (
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-slate-800">{item.title || 'Note'}</h4>

                <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{item.note}</p>

                <div className="mt-4 flex items-center gap-3 text-xs text-slate-500">
                  <span>
                    {new Date(item.createdAt).toLocaleString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>

                  {item.attachments?.length ? (
                    <>
                      <span>•</span>

                      <Tooltip title="Download attachment">
                        <a
                          href={item.attachments[0].fileUrl}
                          download={item.attachments[0].fileName}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button type="text" size="small" icon={<DownloadOutlined />}>
                            Download
                          </Button>
                        </a>
                      </Tooltip>
                    </>
                  ) : null}
                </div>
              </div>

              <div className="min-w-[180px] shrink-0 text-right">
                <div className="text-sm font-medium text-slate-800">
                  {item.addedBy?.name || 'System'}
                </div>

                <div className="mt-1 text-xs text-slate-500 break-all">{item.addedBy?.email}</div>
              </div>
            </div>
          ),
        }))}
      />
    </Card>
  );
}
