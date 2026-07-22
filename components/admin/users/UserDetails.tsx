'use client';

import { useEffect, useState } from 'react';
import { Avatar, Card, Col, Descriptions, Divider, Row, Skeleton, Tag } from 'antd';
import { UserOutlined } from '@ant-design/icons';

interface Props {
  id: string;
}

export default function UserDetails({ id }: Props) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      const res = await fetch(`/api/users/${id}`);
      const data = await res.json();

      if (data.success) {
        setUser(data.user);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!user && !loading) {
    return <div>User not found.</div>;
  }

  return (
    <Row gutter={24}>
      <Col xs={24} md={8}>
        <Card className="h-full">
          <div className="flex flex-col items-center">
            {loading ? (
              <>
                <Skeleton.Avatar active size={120} shape="circle" />

                <div className="mt-4 w-44">
                  <Skeleton.Input active block />
                </div>

                <div className="mt-3">
                  <Skeleton.Button active size="small" />
                </div>
              </>
            ) : (
              <>
                <Avatar size={120} src={user.avatar || undefined} icon={<UserOutlined />} />

                <h2 className="mt-4 text-xl font-semibold">{user.name}</h2>

                <Tag color={user.status === 'active' ? 'green' : 'red'}>
                  {user.status.toUpperCase()}
                </Tag>
              </>
            )}
          </div>

          <Divider />

          {loading ? (
            <Skeleton active paragraph={{ rows: 6 }} />
          ) : (
            <Descriptions column={1}>
              <Descriptions.Item label="Employee ID">{user.employeeId}</Descriptions.Item>

              <Descriptions.Item label="Role">{user.role}</Descriptions.Item>

              <Descriptions.Item label="Department">{user.department || '-'}</Descriptions.Item>

              <Descriptions.Item label="Designation">{user.designation || '-'}</Descriptions.Item>

              <Descriptions.Item label="Joining Date">
                {user.joiningDate ? new Date(user.joiningDate).toLocaleDateString() : '-'}
              </Descriptions.Item>
            </Descriptions>
          )}
        </Card>
      </Col>

      <Col xs={24} md={16}>
        <Card title="Personal Information">
          {loading ? (
            <Skeleton active paragraph={{ rows: 18 }} />
          ) : (
            <>
              <Descriptions bordered column={2}>
                <Descriptions.Item label="Name">{user.name}</Descriptions.Item>

                <Descriptions.Item label="Email">{user.email}</Descriptions.Item>

                <Descriptions.Item label="Phone">{user.phone}</Descriptions.Item>

                <Descriptions.Item label="Date of Birth">
                  {user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : '-'}
                </Descriptions.Item>
              </Descriptions>

              <Divider />

              <h3 className="text-lg font-semibold mb-4">Address</h3>

              <Descriptions bordered column={1}>
                <Descriptions.Item label="Address Line 1">
                  {user.address?.addressLine1 || '-'}
                </Descriptions.Item>

                <Descriptions.Item label="Address Line 2">
                  {user.address?.addressLine2 || '-'}
                </Descriptions.Item>

                <Descriptions.Item label="City">{user.address?.city || '-'}</Descriptions.Item>

                <Descriptions.Item label="State">{user.address?.state || '-'}</Descriptions.Item>

                <Descriptions.Item label="Postal Code">
                  {user.address?.postalCode || '-'}
                </Descriptions.Item>
              </Descriptions>

              <Divider />

              <h3 className="text-lg font-semibold mb-4">Documents</h3>

              <Descriptions bordered column={1}>
                <Descriptions.Item label="Aadhaar">
                  {user.documents?.aadhaarNumber || '-'}
                </Descriptions.Item>

                <Descriptions.Item label="PAN">
                  {user.documents?.panNumber || '-'}
                </Descriptions.Item>

                <Descriptions.Item label="Driving License">
                  {user.documents?.drivingLicenseNumber || '-'}
                </Descriptions.Item>
              </Descriptions>

              <Divider />

              <h3 className="text-lg font-semibold mb-4">Bank Details</h3>

              <Descriptions bordered column={2}>
                <Descriptions.Item label="Account Holder">
                  {user.bank?.accountHolderName || '-'}
                </Descriptions.Item>

                <Descriptions.Item label="Account Number">
                  {user.bank?.accountNumber || '-'}
                </Descriptions.Item>

                <Descriptions.Item label="IFSC">{user.bank?.ifscCode || '-'}</Descriptions.Item>

                <Descriptions.Item label="Bank">{user.bank?.bankName || '-'}</Descriptions.Item>

                <Descriptions.Item label="Branch">{user.bank?.branchName || '-'}</Descriptions.Item>
              </Descriptions>
            </>
          )}
        </Card>
      </Col>
    </Row>
  );
}
