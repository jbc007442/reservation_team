'use client';

import { Button, Result } from 'antd';

import MainTable from '@/components/user/authform/maintable';

import { useAuthStore } from '@/store/authStore';

export default function Page() {
  /*
  |--------------------------------------------------------------------------
  | Auth Store
  |--------------------------------------------------------------------------
  */

  const { user, loading } = useAuthStore();

  /*
  |--------------------------------------------------------------------------
  | Auth Form Permission
  |--------------------------------------------------------------------------
  */

  const userPermissions = Array.isArray((user as any)?.permissions)
    ? ((user as any).permissions as string[])
    : [];

  const allowed =
    user?.status === 'active' &&
    (user?.role === 'admin' || userPermissions.includes('booking.authform'));

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-slate-500">Loading...</div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Access Denied
  |--------------------------------------------------------------------------
  */

  if (!allowed) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-6">
        <Result
          status="403"
          title="403"
          subTitle="You do not have permission to access Auth Form."
          extra={
            <Button
              type="primary"
              onClick={() => {
                window.location.href = '/dashboard';
              }}
            >
              Back to Dashboard
            </Button>
          }
        />
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Auth Form
  |--------------------------------------------------------------------------
  */

  return (
    <div className="p-6">
      <MainTable />
    </div>
  );
}
