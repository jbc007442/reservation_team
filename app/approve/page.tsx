'use client';

import { Suspense, useEffect, useState } from 'react';
import { Result, Spin } from 'antd';
import { useSearchParams } from 'next/navigation';

function ApproveContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setSuccess(false);
      setMessage('Missing authorization token.');
      return;
    }

    const approve = async () => {
      try {
        const res = await fetch(`/api/authform/approve?token=${token}`);
        const data = await res.json();

        setSuccess(data.success);
        setMessage(data.message);
      } catch {
        setSuccess(false);
        setMessage('Something went wrong.');
      } finally {
        setLoading(false);
      }
    };

    approve();
  }, [token]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return success ? (
    <Result status="success" title="Thank You!" subTitle={message} />
  ) : (
    <Result status="error" title="Authorization Failed" subTitle={message} />
  );
}

export default function ApprovePage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Spin size="large" />
        </div>
      }
    >
      <ApproveContent />
    </Suspense>
  );
}
