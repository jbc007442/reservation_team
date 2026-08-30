'use client';

import { useEffect, useState } from 'react';

import { ArrowLeftOutlined, UserOutlined } from '@ant-design/icons';

import { Card, Divider, message, Spin, Switch, Tag, Typography } from 'antd';

import { useRouter } from 'next/navigation';

const { Title, Text } = Typography;

/*
|--------------------------------------------------------------------------
| User
|--------------------------------------------------------------------------
*/

interface User {
  _id: string;
  employeeId: string;
  name: string;
  email?: string;
  role: 'admin' | 'employee' | 'accountant';
  permissions?: string[];
  status: 'active' | 'inactive';
}

/*
|--------------------------------------------------------------------------
| Permission
|--------------------------------------------------------------------------
*/

interface PermissionItem {
  label: string;
  key: string;
}

interface PermissionSection {
  title: string;
  items: PermissionItem[];
}

interface PermissionGroup {
  module: string;
  sections: PermissionSection[];
}

/*
|--------------------------------------------------------------------------
| Permissions
|--------------------------------------------------------------------------
*/

const permissions: PermissionGroup[] = [
  {
    module: 'Booking',

    sections: [
      {
        title: 'Query',
        items: [
          {
            label: 'View Query',
            key: 'booking.query',
          },
          {
            label: 'Create Query',
            key: 'booking.create',
          },
          {
            label: 'Edit Query',
            key: 'booking.edit',
          },
          {
            label: 'Delete Query',
            key: 'booking.delete',
          },
        ],
      },

      {
        title: 'Auth Form',
        items: [
          {
            label: 'View Auth Form',
            key: 'booking.authform.view',
          },
          {
            label: 'Auth Form',
            key: 'booking.authform',
          },
        ],
      },

      {
        title: 'Auth Form Tabs',
        items: [
          {
            label: 'Approval',
            key: 'booking.authform.approval.view',
          },
          {
            label: 'Mail',
            key: 'booking.authform.mail.view',
          },
          {
            label: 'Billing',
            key: 'booking.authform.billing.view',
          },
          {
            label: 'History',
            key: 'booking.authform.history.view',
          },
          {
            label: 'Notes',
            key: 'booking.authform.notes.view',
          },
          {
            label: 'Itinerary',
            key: 'booking.authform.itinerary.view',
          },
        ],
      },

      {
        title: 'DPR',
        items: [
          {
            label: 'DPR',
            key: 'booking.dpr',
          },
          {
            label: 'Create DPR',
            key: 'booking.dpr.create',
          },
          {
            label: 'Edit DPR',
            key: 'booking.dpr.edit',
          },
          {
            label: 'Delete DPR',
            key: 'booking.dpr.delete',
          },
        ],
      },
    ],
  },
];

/*
|--------------------------------------------------------------------------
| Component
|--------------------------------------------------------------------------
*/

export default function UserPermission({ id }: { id: string }) {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);

  const [loading, setLoading] = useState(true);

  /*
  |--------------------------------------------------------------------------
  | Which permissions are enabled
  |--------------------------------------------------------------------------
  */

  const [enabledPermissions, setEnabledPermissions] = useState<Record<string, boolean>>({});

  /*
  |--------------------------------------------------------------------------
  | Currently updating permissions
  |--------------------------------------------------------------------------
  */

  const [updatingPermissions, setUpdatingPermissions] = useState<Record<string, boolean>>({});

  /*
  |--------------------------------------------------------------------------
  | Fetch User
  |--------------------------------------------------------------------------
  */

  const fetchUser = async () => {
    try {
      setLoading(true);

      const response = await fetch(`/api/admin/permissions/${id}`, {
        method: 'GET',
        cache: 'no-store',
        credentials: 'include',
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to fetch user permissions');
      }

      setUser(result.data);

      /*
      |--------------------------------------------------------------------------
      | Load Existing Permissions
      |--------------------------------------------------------------------------
      */

      const permissionState: Record<string, boolean> = {};

      if (Array.isArray(result.data.permissions)) {
        result.data.permissions.forEach((permission: string) => {
          permissionState[permission] = true;
        });
      }

      setEnabledPermissions(permissionState);
    } catch (error) {
      console.error('Permission fetch error:', error);

      message.error(error instanceof Error ? error.message : 'Failed to fetch user permissions');
    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Load
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    fetchUser();
  }, [id]);

  /*
  |--------------------------------------------------------------------------
  | Update Permission Immediately
  |--------------------------------------------------------------------------
  */

  const updatePermissions = async (permissionKeys: string[], checked: boolean) => {
    if (!user) return;

    /*
    |--------------------------------------------------------------------------
    | Do not allow permission changes for admin
    |--------------------------------------------------------------------------
    */

    if (user.role === 'admin') {
      message.info('Admin has full access.');
      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Calculate new permissions
    |--------------------------------------------------------------------------
    */

    const currentPermissions = user.permissions || [];

    let newPermissions: string[];

    if (checked) {
      newPermissions = [...new Set([...currentPermissions, ...permissionKeys])];
    } else {
      newPermissions = currentPermissions.filter(
        (permission) => !permissionKeys.includes(permission)
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Optimistic UI Update
    |--------------------------------------------------------------------------
    */

    setEnabledPermissions((previous) => {
      const updated = { ...previous };

      permissionKeys.forEach((permission) => {
        updated[permission] = checked;
      });

      return updated;
    });

    /*
    |--------------------------------------------------------------------------
    | Update Loading State
    |--------------------------------------------------------------------------
    */

    setUpdatingPermissions((previous) => {
      const updated = { ...previous };

      permissionKeys.forEach((permission) => {
        updated[permission] = true;
      });

      return updated;
    });

    try {
      /*
      |--------------------------------------------------------------------------
      | Save Directly To Database
      |--------------------------------------------------------------------------
      */

      const response = await fetch(`/api/admin/permissions/${id}`, {
        method: 'PATCH',

        headers: {
          'Content-Type': 'application/json',
        },

        credentials: 'include',

        body: JSON.stringify({
          permissions: newPermissions,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to update permissions');
      }

      /*
      |--------------------------------------------------------------------------
      | Update User From Database Response
      |--------------------------------------------------------------------------
      */

      setUser(result.data);

      const updatedPermissionState: Record<string, boolean> = {};

      if (Array.isArray(result.data.permissions)) {
        result.data.permissions.forEach((permission: string) => {
          updatedPermissionState[permission] = true;
        });
      }

      setEnabledPermissions(updatedPermissionState);

      message.success(checked ? 'Permission enabled.' : 'Permission disabled.');
    } catch (error) {
      console.error('Permission update error:', error);

      /*
      |--------------------------------------------------------------------------
      | Revert UI If API Fails
      |--------------------------------------------------------------------------
      */

      const originalState: Record<string, boolean> = {};

      if (Array.isArray(user.permissions)) {
        user.permissions.forEach((permission) => {
          originalState[permission] = true;
        });
      }

      setEnabledPermissions(originalState);

      message.error(error instanceof Error ? error.message : 'Failed to update permissions');
    } finally {
      setUpdatingPermissions((previous) => {
        const updated = { ...previous };

        permissionKeys.forEach((permission) => {
          delete updated[permission];
        });

        return updated;
      });
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Individual Permission Toggle
  |--------------------------------------------------------------------------
  */

  const handlePermissionChange = (permission: string, checked: boolean) => {
    updatePermissions([permission], checked);
  };

  /*
  |--------------------------------------------------------------------------
  | Module Toggle
  |--------------------------------------------------------------------------
  */

  const handleModuleToggle = (group: PermissionGroup, checked: boolean) => {
    const permissionKeys = group.sections.flatMap((section) =>
      section.items.map((permission) => permission.key)
    );

    updatePermissions(permissionKeys, checked);
  };

  /*
  |--------------------------------------------------------------------------
  | Counts
  |--------------------------------------------------------------------------
  */

  const totalPermissions = permissions.reduce(
    (total, group) =>
      total +
      group.sections.reduce((sectionTotal, section) => sectionTotal + section.items.length, 0),
    0
  );

  const enabledCount = permissions.reduce(
    (total, group) =>
      total +
      group.sections.reduce(
        (sectionTotal, section) =>
          sectionTotal +
          section.items.filter((permission) => enabledPermissions[permission.key]).length,
        0
      ),
    0
  );

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | User Not Found
  |--------------------------------------------------------------------------
  */

  if (!user) {
    return (
      <div className="p-6">
        <Text type="secondary">User not found</Text>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <div className="min-h-full space-y-6">
      {/* Header */}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="
              flex h-10 w-10 items-center justify-center
              rounded-xl border border-gray-200 bg-white
              text-gray-600 shadow-sm
              transition
              hover:border-blue-200
              hover:bg-blue-50
              hover:text-blue-600
            "
          >
            <ArrowLeftOutlined />
          </button>

          <div>
            <Title level={3} style={{ margin: 0 }}>
              User Permissions
            </Title>

            <Text type="secondary">Manage access and permissions for this user</Text>
          </div>
        </div>
      </div>

      {/* User Profile */}

      <Card
        bordered={false}
        className="overflow-hidden rounded-2xl shadow-sm"
        styles={{
          body: {
            padding: 0,
          },
        }}
      >
        <div className="bg-gradient-to-r from-blue-50 via-white to-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div
                className="
                  flex h-16 w-16 items-center justify-center
                  rounded-2xl bg-blue-100
                  text-2xl text-blue-600
                "
              >
                <UserOutlined />
              </div>

              <div>
                <div className="text-xl font-semibold text-gray-900">{user.name}</div>

                <div className="mt-1 text-sm text-gray-500">
                  {user.employeeId}

                  {user.email && (
                    <>
                      <span className="mx-2">•</span>

                      {user.email}
                    </>
                  )}
                </div>
              </div>
            </div>

            <Tag
              color={user.role === 'admin' ? 'red' : user.role === 'accountant' ? 'blue' : 'green'}
              className="rounded-full px-4 py-1 text-sm font-medium uppercase"
            >
              {user.role}
            </Tag>
          </div>
        </div>

        {/* Summary */}

        <div className="border-t border-gray-100 bg-white px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm font-medium text-gray-700">Permission Access</div>

              <div className="mt-0.5 text-xs text-gray-400">Changes are saved automatically</div>
            </div>

            <div className="rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600">
              {enabledCount} / {totalPermissions} Enabled
            </div>
          </div>
        </div>
      </Card>

      {/* Permission Sections */}

      <div className="space-y-4 p-4">
        {permissions.map((group) => (
          <div key={group.module} className="space-y-4">
            {group.sections.map((section: PermissionSection) => {
              const sectionEnabledCount = section.items.filter(
                (permission) => enabledPermissions[permission.key]
              ).length;

              return (
                <div
                  key={section.title}
                  className="overflow-hidden rounded-xl border border-gray-100"
                >
                  {/* Section Header */}

                  <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-4 py-3">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wider text-gray-600">
                        {section.title}
                      </div>

                      <div className="mt-0.5 text-xs text-gray-400">
                        {sectionEnabledCount} of {section.items.length} enabled
                      </div>
                    </div>
                  </div>

                  {/* Section Permissions */}

                  <div className="bg-white p-2">
                    {section.items.map((permission, index) => {
                      const enabled = enabledPermissions[permission.key] || false;
                      const updating = updatingPermissions[permission.key] || false;

                      return (
                        <div key={permission.key}>
                          <div
                            className={`
                              flex items-center justify-between
                              rounded-lg px-3 py-3
                              transition
                              ${enabled ? 'bg-blue-50/70' : 'hover:bg-gray-50'}
                            `}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`
                                  h-2 w-2 rounded-full
                                  ${enabled ? 'bg-blue-500' : 'bg-gray-300'}
                                `}
                              />

                              <div>
                                <div
                                  className={`
                                    text-sm font-medium
                                    ${enabled ? 'text-gray-900' : 'text-gray-600'}
                                  `}
                                >
                                  {permission.label}
                                </div>

                                <div className="text-xs text-gray-400">
                                  {updating
                                    ? 'Updating...'
                                    : enabled
                                      ? 'Access enabled'
                                      : 'Access disabled'}
                                </div>
                              </div>
                            </div>

                            <Switch
                              size="small"
                              checked={enabled}
                              loading={updating}
                              disabled={user.role === 'admin'}
                              onChange={(checked) =>
                                handlePermissionChange(permission.key, checked)
                              }
                            />
                          </div>

                          {index < section.items.length - 1 && <Divider className="!my-1" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
