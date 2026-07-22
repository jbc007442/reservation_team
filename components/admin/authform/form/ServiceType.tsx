'use client';

import { Form, Select } from 'antd';

const serviceTypeOptions = [
  { label: 'Changes', value: 'CHANGES' },
  { label: 'Cancellation Credit', value: 'CANCELLATION_CREDIT' },
  { label: 'Cancellation Refund', value: 'CANCELLATION_REFUND' },
  { label: 'Baggage Added', value: 'BAGGAGE_ADDED' },
  { label: 'Name Correction', value: 'NAME_CORRECTION' },
  { label: 'Upgrade', value: 'UPGRADE' },
  { label: 'New Booking', value: 'NEW_BOOKING' },
  { label: 'Seats', value: 'SEATS' },
  { label: 'Pet Addition', value: 'PET_ADDITION' },
  { label: 'Cabin Upgrade', value: 'CABIN_UPGRADE' },
  { label: 'Service Fee', value: 'SERVICE_FEE' },
  { label: 'Others', value: 'OTHERS' },
  { label: 'Car Rental', value: 'CAR_RENTAL' },
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
