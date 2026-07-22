'use client';

import { useEffect, useState } from 'react';
import { Form, Input, Button, Card, DatePicker, Select, Row, Col, message } from 'antd';
import dayjs from 'dayjs';
import { useAuthStore } from '@/store/authStore';
import { LoadingOutlined } from '@ant-design/icons';

const { Option } = Select;

export default function EditProfile() {
  const { user, fetchUser } = useAuthStore();
  const [loadingPincode, setLoadingPincode] = useState(false);
  const [loadingIfsc, setLoadingIfsc] = useState(false);

  const [form] = Form.useForm();

  const fetchIFSC = async (ifsc: string) => {
    if (ifsc.length !== 11) return;

    try {
      setLoadingIfsc(true);

      const res = await fetch(`https://ifsc.razorpay.com/${ifsc.toUpperCase()}`);

      if (!res.ok) throw new Error();

      const data = await res.json();

      form.setFieldsValue({
        bank: {
          ...form.getFieldValue('bank'),
          ifscCode: ifsc.toUpperCase(),
          bankName: data.BANK,
          branchName: data.BRANCH,
        },
      });
    } catch {
      message.error('Invalid IFSC Code');
    } finally {
      setLoadingIfsc(false);
    }
  };

  const fetchPincode = async (pincode: string) => {
    if (pincode.length !== 6) return;

    try {
      setLoadingPincode(true);

      const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);

      const data = await res.json();

      if (data[0]?.Status === 'Success' && data[0]?.PostOffice?.length) {
        const office = data[0].PostOffice[0];

        form.setFieldsValue({
          address: {
            ...form.getFieldValue('address'),
            state: office.State,
            city: office.District,
            country: office.Country,
          },
        });
      } else {
        message.error('Invalid Pincode');
      }
    } catch {
      message.error('Unable to fetch address');
    } finally {
      setLoadingPincode(false);
    }
  };

  useEffect(() => {
    if (!user) return;

    form.setFieldsValue({
      ...user,
      dateOfBirth: user.dateOfBirth ? dayjs(user.dateOfBirth) : undefined,
      joiningDate: user.joiningDate ? dayjs(user.joiningDate) : undefined,
    });
  }, [user]);

  const onFinish = async (values: any) => {
    values.dateOfBirth = values.dateOfBirth?.toISOString();
    values.joiningDate = values.joiningDate?.toISOString();

    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(values),
    });

    if (res.ok) {
      message.success('Profile updated');
      fetchUser();
    } else {
      message.error('Update failed');
    }
  };

  return (
    <Card title="Update Profile">
      <Form layout="vertical" form={form} onFinish={onFinish}>
        <Row gutter={[16, 16]}>
          {/* Basic Information */}
          <Col xs={24} md={12}>
            <Form.Item label="Employee ID">
              <Input value={user?.employeeId} disabled />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="name"
              label="Name"
              rules={[{ required: true, message: 'Please enter your name' }]}
            >
              <Input placeholder="Full Name" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item label="Email">
              <Input value={user?.email} disabled />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="phone"
              label="Phone"
              rules={[
                { required: true, message: 'Please enter phone number' },
                {
                  pattern: /^[6-9]\d{9}$/,
                  message: 'Enter valid mobile number',
                },
              ]}
            >
              <Input maxLength={10} placeholder="Phone Number" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item name="gender" label="Gender">
              <Select placeholder="Select Gender">
                <Option value="Male">Male</Option>
                <Option value="Female">Female</Option>
                <Option value="Other">Other</Option>
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item name="dateOfBirth" label="Date of Birth">
              <DatePicker className="w-full" format="DD/MM/YYYY" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item name="department" label="Department">
              <Input placeholder="Department" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item name="designation" label="Designation">
              <Input placeholder="Designation" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item name="joiningDate" label="Joining Date">
              <DatePicker className="w-full" format="DD/MM/YYYY" />
            </Form.Item>
          </Col>

          {/* Address */}
          <Col span={24}>
            <h3 className="text-lg font-semibold border-b pb-2">Address Information</h3>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item name={['address', 'addressLine1']} label="Address Line 1">
              <Input placeholder="House No., Street" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item name={['address', 'addressLine2']} label="Address Line 2">
              <Input placeholder="Area / Landmark" />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item
              name={['address', 'postalCode']}
              label="Postal Code"
              rules={[
                {
                  pattern: /^[1-9][0-9]{5}$/,
                  message: 'Enter valid pincode',
                },
              ]}
            >
              <Input
                maxLength={6}
                placeholder="Pincode"
                suffix={loadingPincode ? <LoadingOutlined spin /> : null}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');

                  form.setFieldValue(['address', 'postalCode'], value);

                  if (value.length === 6) {
                    fetchPincode(value);
                  }
                }}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item name={['address', 'city']} label="City">
              <Input readOnly placeholder="Auto Filled" />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item name={['address', 'state']} label="State">
              <Input readOnly placeholder="Auto Filled" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item name={['address', 'country']} label="Country">
              <Input readOnly placeholder="Auto Filled" />
            </Form.Item>
          </Col>

          {/* Documents */}
          <Col span={24}>
            <h3 className="text-lg font-semibold border-b pb-2">Documents</h3>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item name={['documents', 'aadhaarNumber']} label="Aadhaar Number">
              <Input maxLength={12} />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item name={['documents', 'panNumber']} label="PAN Number">
              <Input maxLength={10} style={{ textTransform: 'uppercase' }} />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item name={['documents', 'drivingLicenseNumber']} label="Driving Licence">
              <Input />
            </Form.Item>
          </Col>

          {/* Bank Details */}
          <Col span={24}>
            <h3 className="text-lg font-semibold border-b pb-2">Bank Details</h3>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name={['bank', 'accountHolderName']}
              label="Account Holder Name"
              rules={[
                {
                  required: true,
                  message: 'Please enter account holder name',
                },
              ]}
            >
              <Input placeholder="Account Holder Name" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name={['bank', 'accountNumber']}
              label="Account Number"
              rules={[
                {
                  required: true,
                  message: 'Please enter account number',
                },
              ]}
            >
              <Input placeholder="Account Number" inputMode="numeric" maxLength={18} />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item
              name={['bank', 'ifscCode']}
              label="IFSC Code"
              rules={[
                {
                  required: true,
                  message: 'Please enter IFSC code',
                },
                {
                  pattern: /^[A-Z]{4}0[A-Z0-9]{6}$/,
                  message: 'Enter a valid IFSC code',
                },
              ]}
            >
              <Input
                placeholder="SBIN0001234"
                maxLength={11}
                style={{ textTransform: 'uppercase' }}
                suffix={loadingIfsc ? <LoadingOutlined spin /> : null}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');

                  form.setFieldValue(['bank', 'ifscCode'], value);

                  if (value.length === 11) {
                    fetchIFSC(value);
                  } else {
                    form.setFieldsValue({
                      bank: {
                        ...form.getFieldValue('bank'),
                        bankName: '',
                        branchName: '',
                      },
                    });
                  }
                }}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item name={['bank', 'bankName']} label="Bank Name">
              <Input placeholder="Auto Filled" readOnly />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item name={['bank', 'branchName']} label="Branch">
              <Input placeholder="Auto Filled" readOnly />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item
              name={['bank', 'accountType']}
              label="Account Type"
              rules={[
                {
                  required: true,
                  message: 'Please select account type',
                },
              ]}
            >
              <Select placeholder="Select Account Type">
                <Option value="Savings">Savings</Option>
                <Option value="Current">Current</Option>
                <Option value="Salary">Salary</Option>
                <Option value="NRE">NRE</Option>
                <Option value="NRO">NRO</Option>
              </Select>
            </Form.Item>
          </Col>

          {/* Button */}
          <Col span={24}>
            <Button type="primary" htmlType="submit" size="large" className="w-full md:w-auto">
              Update Profile
            </Button>
          </Col>
        </Row>
      </Form>
    </Card>
  );
}
