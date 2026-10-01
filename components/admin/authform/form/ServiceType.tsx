'use client';

import { Form, Select } from 'antd';

const serviceTypeOptions = [
  { label: 'Changes', value: 'CHANGES' },
  { label: 'Cancellation Credit', value: 'CANCELLATION CREDIT' },
  { label: 'Cancellation Refund', value: 'CANCELLATION REFUND' },
  { label: 'Baggage Added', value: 'BAGGAGE ADDED' },
  { label: 'Name Correction', value: 'NAME CORRECTION' },
  { label: 'Upgrade', value: 'UPGRADE' },
  { label: 'New Booking', value: 'NEW BOOKING' },
  { label: 'Seats', value: 'SEATS' },
  { label: 'Pet Addition', value: 'PET ADDITION' },
  { label: 'Cabin Upgrade', value: 'CABIN UPGRADE' },
  { label: 'Service Fee', value: 'SERVICE FEE' },
  { label: 'Others', value: 'OTHERS' },
  { label: 'Car Rental', value: 'CAR RENTAL' },
  { label: 'Insurance', value: 'INSURANCE' },
];

export default function ServiceType() {
  return (
    <Form.Item
      label="Service Type"
      name="serviceType"
      rules={[{ required: true, message: 'Please select a service type' }]}
    >
      <Select
        placeholder="Select Service Type"
        options={serviceTypeOptions}
        showSearch
        optionFilterProp="label"
      />
    </Form.Item>
  );
}
