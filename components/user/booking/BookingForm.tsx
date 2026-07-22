'use client';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';

import { Button, Card, Col, DatePicker, Form, Input, InputNumber, Row, Select, Space } from 'antd';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { App } from 'antd';

const { TextArea } = Input;

interface BookingFormProps {
  booking?: any;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function BookingForm({ booking, onCancel, onSuccess }: BookingFormProps) {
  const [form] = Form.useForm();
  const router = useRouter();
  const { user } = useAuthStore();
  const { message } = App.useApp();
  const [passengerTypeLocked, setPassengerTypeLocked] = useState(false);
  const isEdit = !!booking;

  const checkExistingCustomer = async (mobile: string) => {
    if (mobile.length !== 10) return;

    try {
      const res = await fetch(`/api/booking?mobile=${mobile}`);
      const data = await res.json();

      if (data.exists) {
        form.setFieldsValue({
          title: data.customer.title,
          clientName: data.customer.name,
          email: data.customer.email,
          reason: data.passengerType || 'repeat',
        });

        setPassengerTypeLocked(true);
      } else {
        form.setFieldsValue({
          reason: 'fresh',
        });

        setPassengerTypeLocked(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!booking) {
      form.resetFields();
      return;
    }

    form.setFieldsValue({
      mobile: booking.customer?.mobile,
      email: booking.customer?.email,
      title: booking.customer?.title,
      clientName: booking.customer?.name,

      fromCity: booking.journey?.fromCity,
      toCity: booking.journey?.toCity,

      fromDate: booking.journey?.departureDate ? dayjs(booking.journey.departureDate) : null,

      toDate: booking.journey?.returnDate ? dayjs(booking.journey.returnDate) : null,

      adults: booking.journey?.adults,
      child: booking.journey?.children,
      infant: booking.journey?.infants,

      leadSource: booking.callType,
      websites: booking.websites,

      reason: booking.saleType,
      service: booking.service,
      remark: booking.remark,
    });
  }, [booking, form]);

  const handleFinish = async (values: any) => {
    try {
      console.log('========== BOOKING SUBMIT ==========');
      console.log('Form Values:', values);
      console.log('Logged User:', user);

      const payload: any = {
        customer: {
          title: values.title,
          name: values.clientName,
          mobile: values.mobile,
          email: values.email,
        },
        journey: {
          fromCity: values.fromCity,
          toCity: values.toCity,
          departureDate: values.fromDate?.toDate(),
          returnDate: values.toDate?.toDate(),
          adults: values.adults,
          children: values.child,
          infants: values.infant,
        },
        callType: values.leadSource,
        websites: values.websites,
        saleType: values.reason,
        service: values.service,
        remark: values.remark,
      };

      // Only while creating a new booking
      if (!isEdit) {
        payload.bookingNo = `BK${Date.now()}`;
        payload.createdBy = user?._id;
      }

      console.log('Payload:', payload);

      const res = await fetch(isEdit ? `/api/booking/${booking._id}` : '/api/booking', {
        method: isEdit ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('Response Status:', res.status);

      const data = await res.json();

      console.log('API Response:', data);

      if (!res.ok) {
        throw new Error(data.message || `Failed to ${isEdit ? 'update' : 'save'} booking`);
      }

      const bookingId = data.data?._id || booking?._id || data._id;

      message.success(isEdit ? 'Booking updated successfully' : 'Booking saved successfully');

      // For edit, just close the dialog and refresh table
      if (isEdit) {
        onSuccess();
        return;
      }

      // For create, redirect to Auth Form
      if (user?.role === 'admin') {
        router.push(`/admin/booking/authform/${bookingId}`);
      } else {
        router.push(`/dashboard/booking/authform/${bookingId}`);
      }

      setTimeout(() => {
        form.resetFields();
        onSuccess();
      }, 500);
    } catch (error: any) {
      console.error('Submit Error:', error);
      message.error(error.message || 'Failed to save booking');
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      size="small"
      onFinish={handleFinish}
      initialValues={{
        type: 'Client',
        title: 'Mr.',
        adults: 1,
        child: 0,
        infant: 0,
        priority: 'General Query',
        ...booking,
      }}
    >
      <Card variant="borderless">
        <Row gutter={[12, 0]}>
          {/* Mobile */}
          <Col xs={24} md={12}>
            <Form.Item
              label="Mobile Number"
              name="mobile"
              rules={[
                { required: true, message: 'Please enter mobile number' },
                { pattern: /^[6-9]\d{9}$/, message: 'Enter a valid mobile number' },
              ]}
            >
              <Input
                placeholder="9876543210"
                maxLength={10}
                allowClear
                onChange={(e) => {
                  if (e.target.value.length === 10) {
                    checkExistingCustomer(e.target.value);
                  }
                }}
              />
            </Form.Item>
          </Col>

          {/* Email */}
          <Col xs={24} md={12}>
            <Form.Item
              label="Email Address"
              name="email"
              rules={[{ type: 'email', message: 'Enter a valid email address' }]}
            >
              <Input placeholder="name@example.com" allowClear />
            </Form.Item>
          </Col>

          {/* Name */}
          <Col span={24}>
            <Form.Item label="Passenger Name" required style={{ marginBottom: 16 }}>
              <Space.Compact style={{ width: '100%' }}>
                <Form.Item name="title" noStyle rules={[{ required: true }]}>
                  <Select
                    style={{ width: 90 }}
                    options={[
                      { value: 'Mr.', label: 'Mr.' },
                      { value: 'Mrs.', label: 'Mrs.' },
                      { value: 'Ms.', label: 'Ms.' },
                    ]}
                  />
                </Form.Item>

                <Form.Item name="clientName" noStyle rules={[{ required: true }]}>
                  <Input placeholder="Name" />
                </Form.Item>
              </Space.Compact>
            </Form.Item>
          </Col>

          {/* Journey */}
          <Col xs={24} md={12}>
            <Form.Item label="Leaving From" name="fromCity" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item label="Where To" name="toCity" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item label="Departure" name="fromDate" rules={[{ required: true }]}>
              <DatePicker style={{ width: '100%' }} format="DD-MM-YYYY" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item label="Return" name="toDate" rules={[{ required: true }]}>
              <DatePicker style={{ width: '100%' }} format="DD-MM-YYYY" />
            </Form.Item>
          </Col>

          {/* Passenger */}
          <Col xs={8}>
            <Form.Item label="Adult" name="adults">
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
          </Col>

          <Col xs={8}>
            <Form.Item label="Child" name="child">
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </Col>

          <Col xs={8}>
            <Form.Item label="Infant" name="infant">
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </Col>

          {/* Lead */}
          <Col xs={24} md={12}>
            <Form.Item label="Call Type" name="leadSource">
              <Select
                placeholder="Select"
                options={[
                  { value: 'Buffer', label: 'Buffer' },
                  { value: 'PPC', label: 'PPC' },
                  { value: 'Meta', label: 'Meta' },
                  { value: 'Other', label: 'Other' },
                ]}
              />
            </Form.Item>
          </Col>

          <Form.Item noStyle shouldUpdate={(prev, curr) => prev.leadSource !== curr.leadSource}>
            {({ getFieldValue }) =>
              getFieldValue('leadSource') === 'Meta' && (
                <Col span={24}>
                  <Card size="small" title="Meta Websites" style={{ marginBottom: 16 }}>
                    <Form.Item label="Website" required style={{ marginBottom: 12 }}>
                      <Form.List name="websites">
                        {(fields, { add, remove }) => (
                          <>
                            {fields.map(({ key, name, ...restField }) => (
                              <Row key={key} gutter={8} align="middle" style={{ marginBottom: 8 }}>
                                <Col flex="auto">
                                  <Form.Item
                                    {...restField}
                                    name={name}
                                    noStyle
                                    rules={[
                                      {
                                        required: true,
                                        message: 'Enter website',
                                      },
                                    ]}
                                  >
                                    <Input placeholder="facebook.com" />
                                  </Form.Item>
                                </Col>

                                <Col flex="40px">
                                  <Button
                                    danger
                                    type="text"
                                    icon={<DeleteOutlined />}
                                    onClick={() => remove(name)}
                                  />
                                </Col>
                              </Row>
                            ))}

                            <Button
                              block
                              type="dashed"
                              icon={<PlusOutlined />}
                              onClick={() => add()}
                            >
                              Add Website
                            </Button>
                          </>
                        )}
                      </Form.List>
                    </Form.Item>
                  </Card>
                </Col>
              )
            }
          </Form.Item>

          <Form.Item label="Passenger Type" name="reason">
            <Select
              placeholder="Select Passenger Type"
              disabled={passengerTypeLocked}
              options={[
                { value: 'fresh', label: 'New' },
                { value: 'repeat', label: 'Existing' },
                { value: 'referral', label: 'Referral' },
              ]}
            />
          </Form.Item>

          <Col xs={24} md={12}>
            <Form.Item label="Booking Type" name="service">
              <Select
                placeholder="Select Booking Type"
                options={[
                  { value: 'Package', label: 'Package' },
                  { value: 'Flight', label: 'Flight' },
                  { value: 'Hotel', label: 'Hotel' },
                  { value: 'Hotel + Flight', label: 'Hotel + Flight' },
                  { value: 'Cargo', label: 'Cargo' },
                  { value: 'Pet', label: 'Pet' },
                  { value: 'Car', label: 'Car' },
                  { value: 'Cruise', label: 'Cruise' },
                  { value: 'Amtrak', label: 'Amtrak' },
                  { value: 'Other', label: 'Other' },
                ]}
              />
            </Form.Item>
          </Col>

          <Col xs={24}>
            <Form.Item label="Remark" name="remark">
              <TextArea rows={3} placeholder="Booking notes..." />
            </Form.Item>
          </Col>

          {/* Buttons */}
          <Col span={24}>
            <div className="flex justify-end">
              <Space>
                <Button onClick={onCancel}>Cancel</Button>
                <Button type="primary" htmlType="submit">
                  {isEdit ? 'Update Booking' : 'Save Booking'}
                </Button>
              </Space>
            </div>
          </Col>
        </Row>
      </Card>
    </Form>
  );
}
