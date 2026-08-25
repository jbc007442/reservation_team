'use client';

import { useEffect, useState } from 'react';
import { Card, Divider, Switch, Tag, Typography, message, Button } from 'antd';
import {
  ArrowLeftOutlined,
  UserOutlined,
  CheckOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';

const { Title, Text } = Typography;

interface User {
  _id: string;
  employeeId: string;
  name: string;
  email?: string;
  role: 'admin' | 'employee' | 'accountant';
}

interface PermissionGroup {
  module: string;
  items: string[];
}

const permissions: PermissionGroup[] = [
  {
    module: 'Users',
    items: ['View Users', 'Create Users', 'Edit Users', 'Delete Users'],
  },
  {
    module: 'Booking',
    items: ['View Booking', 'Create Booking', 'Edit Booking', 'Delete Booking'],
  },
  {
    module: 'Attendance',
    items: ['View Attendance', 'Mark Attendance', 'Edit Attendance', 'Manage Leaves'],
  },
  {
    module: 'Reports',
    items: ['View Reports', 'Booking Reports', 'Attendance Reports', 'Break Reports'],
  },
];

export default function UserPermission({ id }: { id: string }) {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  /*
  |--------------------------------------------------------------------------
  | Permission State
  |--------------------------------------------------------------------------
  */

  const [enabledPermissions, setEnabledPermissions] = useState<Record<string, boolean>>({});

  /*
  |--------------------------------------------------------------------------
  | Fetch User
  |--------------------------------------------------------------------------
  */

  const fetchUser = async () => {
    try {
      setLoading(true);

      const response = await fetch(`/api/admin/permissions/${id}`);

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to fetch user');
      }

      setUser(result.data);

      /*
       * If API already returns permissions,
       * load them here.
       *
       * Example:
       * result.data.permissions = [...]
       */

      if (Array.isArray(result.data.permissions)) {
        const permissionState: Record<string, boolean> = {};

        result.data.permissions.forEach((permission: string) => {
          permissionState[permission] = true;
        });

        setEnabledPermissions(permissionState);
      }
    } catch (error: any) {
      message.error(error.message || 'Failed to fetch user');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [id]);

  /*
  |--------------------------------------------------------------------------
  | Toggle Permission
  |--------------------------------------------------------------------------
  */

  const handlePermissionChange = (permission: string, checked: boolean) => {
    setEnabledPermissions((prev) => ({
      ...prev,
      [permission]: checked,
    }));
  };

  /*
  |--------------------------------------------------------------------------
  | Toggle Entire Module
  |--------------------------------------------------------------------------
  */

  const handleModuleToggle = (group: PermissionGroup, checked: boolean) => {
    setEnabledPermissions((prev) => {
      const updated = { ...prev };

      group.items.forEach((permission) => {
        updated[permission] = checked;
      });

      return updated;
    });
  };

  /*
  |--------------------------------------------------------------------------
  | Count
  |--------------------------------------------------------------------------
  */

  const totalPermissions = permissions.reduce((total, group) => total + group.items.length, 0);

  const enabledCount = Object.values(enabledPermissions).filter(Boolean).length;

  /*
  |--------------------------------------------------------------------------
  | Save
  |--------------------------------------------------------------------------
  */

  const handleSave = async () => {
    try {
      const selectedPermissions = Object.entries(enabledPermissions)
        .filter(([, enabled]) => enabled)
        .map(([permission]) => permission);

      /*
       * Connect this with your PUT/PATCH API.
       */

      console.log('User:', id);
      console.log('Permissions:', selectedPermissions);

      message.success('Permissions updated successfully.');
    } catch (error) {
      message.error('Failed to update permissions.');
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return <div className="p-6 text-sm text-gray-500">Loading user...</div>;
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
              transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600
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

        <Button type="primary" size="large" icon={<CheckOutlined />} onClick={handleSave}>
          Save Permissions
        </Button>
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

        {/* Permission Summary */}

        <div className="border-t border-gray-100 bg-white px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm font-medium text-gray-700">Permission Access</div>

              <div className="text-xs text-gray-400">Control what this user can access</div>
            </div>

            <div className="rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600">
              {enabledCount} / {totalPermissions} Enabled
            </div>
          </div>
        </div>
      </Card>

      {/* Permissions */}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {permissions.map((group) => {
          const enabledInModule = group.items.filter(
            (permission) => enabledPermissions[permission]
          ).length;

          const moduleEnabled = enabledInModule === group.items.length;

          const modulePartiallyEnabled =
            enabledInModule > 0 && enabledInModule < group.items.length;

          return (
            <Card
              key={group.module}
              bordered={false}
              className="rounded-2xl shadow-sm"
              styles={{
                body: {
                  padding: 0,
                },
              }}
            >
              {/* Module Header */}

              <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                <div>
                  <div className="font-semibold text-gray-900">{group.module}</div>

                  <div className="mt-0.5 text-xs text-gray-400">
                    {enabledInModule} of {group.items.length} permissions enabled
                  </div>
                </div>

                <Switch
                  checked={moduleEnabled}
                  onChange={(checked) => handleModuleToggle(group, checked)}
                  className={modulePartiallyEnabled ? 'opacity-70' : ''}
                />
              </div>

              {/* Permission Items */}

              <div className="p-3">
                {group.items.map((permission, index) => {
                  const enabled = enabledPermissions[permission] || false;

                  return (
                    <div key={permission}>
                      <div
                        className={`
                          flex items-center justify-between
                          rounded-xl px-3 py-3
                          transition
                          ${enabled ? 'bg-blue-50/60' : 'hover:bg-gray-50'}
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
                              {permission}
                            </div>

                            <div className="text-xs text-gray-400">
                              {enabled ? 'Access enabled' : 'Access disabled'}
                            </div>
                          </div>
                        </div>

                        <Switch
                          size="small"
                          checked={enabled}
                          onChange={(checked) => handlePermissionChange(permission, checked)}
                        />
                      </div>

                      {index < group.items.length - 1 && <Divider className="!my-1" />}
                    </div>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
