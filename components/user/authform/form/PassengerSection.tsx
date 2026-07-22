'use client';

import dayjs from 'dayjs';
import { Button, Col, DatePicker, Form, Input, Row, Select } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';

import { PassengerSectionProps } from './types';

export default function PassengerSection({
  booking,
  passengers,
  addPassenger,
  removePassenger,
  updatePassenger,
}: PassengerSectionProps) {
  const customerName = booking.customer.name.trim().split(' ');

  return (
    <>
      {passengers.map((passenger, index) => (
        <Row key={index} gutter={16} align="middle">
          {/* Salutation */}
          <Col xs={24} md={4}>
            <Form.Item label={index === 0 ? 'Salutation' : `Salutation ${index + 1}`}>
              <Select
                placeholder="Select"
                value={passenger.title || 'Mr.'}
                onChange={(value) => updatePassenger(index, 'title', value)}
                options={[
                  { label: 'Mr.', value: 'Mr.' },
                  { label: 'Mrs.', value: 'Mrs.' },
                  { label: 'Ms.', value: 'Ms.' },
                  { label: 'Miss', value: 'Miss' },
                  { label: 'Master', value: 'Master' },
                  { label: 'Dr.', value: 'Dr.' },
                ]}
              />
            </Form.Item>
          </Col>

          {/* First Name */}
          <Col xs={24} md={6}>
            <Form.Item label={index === 0 ? 'First Name' : `First Name ${index + 1}`}>
              <Input
                placeholder="First Name"
                value={passenger.firstName || (index === 0 ? (customerName[0] ?? '') : '')}
                onChange={(e) => updatePassenger(index, 'firstName', e.target.value)}
              />
            </Form.Item>
          </Col>

          {/* Last Name */}
          <Col xs={24} md={6}>
            <Form.Item label={index === 0 ? 'Last Name' : `Last Name ${index + 1}`}>
              <Input
                placeholder="Last Name"
                value={passenger.lastName || (index === 0 ? customerName.slice(1).join(' ') : '')}
                onChange={(e) => updatePassenger(index, 'lastName', e.target.value)}
              />
            </Form.Item>
          </Col>

          {/* DOB */}
          <Col xs={24} md={6}>
            <Form.Item label={index === 0 ? 'DOB' : `DOB ${index + 1}`}>
              <DatePicker
                className="w-full"
                format="DD-MM-YYYY"
                placeholder="Select DOB"
                value={passenger.dob ? dayjs(passenger.dob, 'DD-MM-YYYY') : null}
                onChange={(date) =>
                  updatePassenger(index, 'dob', date ? date.format('DD-MM-YYYY') : '')
                }
              />
            </Form.Item>
          </Col>

          {/* Delete */}
          <Col xs={24} md={2}>
            <Form.Item label=" " colon={false}>
              {index > 0 && (
                <Button
                  danger
                  block
                  icon={<DeleteOutlined />}
                  onClick={() => removePassenger(index)}
                />
              )}
            </Form.Item>
          </Col>
        </Row>
      ))}

      <Form.Item>
        <Button type="dashed" icon={<PlusOutlined />} onClick={addPassenger}>
          Add More Passenger
        </Button>
      </Form.Item>
    </>
  );
}
