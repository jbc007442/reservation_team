'use client';

import { Avatar, Card, Descriptions, Skeleton, Tag } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useAuthStore } from '@/store/authStore';
import Barcode from 'react-barcode';

export default function Profile() {
  const { user, loading } = useAuthStore();

  if (!user && !loading) {
    return (
      <div className="flex h-96 items-center justify-center text-gray-400">
        User profile unavailable.
      </div>
    );
  }

  return (
    <div className="p-6">
      <Card className="rounded-2xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3 min-h-[620px]">
          {/* Left Side */}
          <div className="bg-gray-100 flex flex-col items-center justify-center p-8">
            {loading ? (
              <>
                <Skeleton.Avatar active size={170} shape="circle" />

                <div className="mt-6 w-52">
                  <Skeleton.Input active block size="large" />
                </div>

                <div className="mt-3 w-36">
                  <Skeleton.Input active block />
                </div>

                <div className="mt-4">
                  <Skeleton.Button active size="small" />
                </div>

                <div className="mt-8 w-full">
                  <Skeleton.Input active block style={{ height: 70 }} />
                </div>
              </>
            ) : (
              <>
                <Avatar
                  size={170}
                  src={user?.avatar || undefined}
                  icon={<UserOutlined />}
                  className="border-4 border-white"
                />

                <h2 className="mt-6 text-3xl font-bold text-gray-900 text-center">{user?.name}</h2>

                <p className="mt-2 text-gray-500 text-lg text-center">{user?.role}</p>

                <Tag color={user?.status?.toLowerCase() === 'active' ? 'success' : 'error'}>
                  {user?.status}
                </Tag>

                <div className="mt-8 w-full flex justify-center">
                  <Barcode
                    value={user?.employeeId || ''}
                    format="CODE128"
                    width={1.4}
                    height={55}
                    displayValue
                    fontSize={12}
                    margin={0}
                  />
                </div>
              </>
            )}
          </div>

          {/* Right Side */}
          <div className="lg:col-span-2 p-10">
            <h2 className="text-2xl font-bold mb-8 text-gray-800">Employee Information</h2>

            {loading ? (
              <Skeleton active paragraph={{ rows: 8 }} />
            ) : (
              <Descriptions bordered column={1} size="middle">
                <Descriptions.Item label="Employee ID">{user?.employeeId}</Descriptions.Item>

                <Descriptions.Item label="Full Name">{user?.name}</Descriptions.Item>

                <Descriptions.Item label="Email">{user?.email}</Descriptions.Item>

                <Descriptions.Item label="Phone">{user?.phone}</Descriptions.Item>

                <Descriptions.Item label="Department">{user?.department}</Descriptions.Item>

                <Descriptions.Item label="Designation">{user?.designation}</Descriptions.Item>

                <Descriptions.Item label="Role">{user?.role}</Descriptions.Item>

                <Descriptions.Item label="Status">
                  <Tag color={user?.status?.toLowerCase() === 'active' ? 'success' : 'error'}>
                    {user?.status}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}