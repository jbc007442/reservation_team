'use client';

import { Button, Result } from 'antd';

import Dpr from '@/components/user/dpr/Dpr';

import { useAuthStore } from '@/store/authStore';

const Page = () => {
  /*
  |--------------------------------------------------------------------------
  | Auth Store
  |--------------------------------------------------------------------------
  */

  const { user, loading } = useAuthStore();

  /*
  |--------------------------------------------------------------------------
  | Permission
  |--------------------------------------------------------------------------
  */

  const permissions = (user as { permissions?: string[] } | null | undefined)?.permissions ?? [];

  const allowed =
    user?.status === 'active' &&
    (user?.role === 'admin' || permissions.includes('booking.dpr'));

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
          subTitle="You do not have permission to access DPR."
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
  | DPR
  |--------------------------------------------------------------------------
  */

  return <Dpr />;
};

export default Page;
