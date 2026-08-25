'use client';

import { useEffect } from 'react';
import { Button, Card, Col, DatePicker, Form, Input, Row, Select } from 'antd';
import dayjs from 'dayjs';

import { useAuthStore } from '@/store/authStore';

const { TextArea } = Input;

export interface DprData {
  _id?: string;
  date: dayjs.Dayjs | null;
  agentName: string;
  callType: string;
  meta?: string;
  phoneNumber: string;
  airline: string;
  callQuery: string;
  notes: string;
}

interface DprFormProps {
  editingRecord: DprData | null;
  onSubmit: (values: DprData) => Promise<void> | void;
  onCancelEdit: () => void;
}

export default function DprForm({ editingRecord, onSubmit, onCancelEdit }: DprFormProps) {
  const [form] = Form.useForm();

  /*
  |--------------------------------------------------------------------------
  | Logged-in User from Zustand
  |--------------------------------------------------------------------------
  */

  const user = useAuthStore((state) => state.user);

  const agentName = user?.name || '';

  /*
  |--------------------------------------------------------------------------
  | Watch Call Type
  |--------------------------------------------------------------------------
  */

  const callType = Form.useWatch('callType', form);

  /*
  |--------------------------------------------------------------------------
  | Set Form Values
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (editingRecord) {
      form.setFieldsValue({
        ...editingRecord,

        date: editingRecord.date ? dayjs(editingRecord.date) : dayjs(),

        agentName,
      });
    } else {
      form.resetFields();

      form.setFieldsValue({
        date: dayjs(),
        agentName,
      });
    }
  }, [editingRecord, agentName, form]);

  /*
  |--------------------------------------------------------------------------
  | Clear META when another Call Type is selected
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (callType !== 'meta') {
      form.setFieldValue('meta', undefined);
    }
  }, [callType, form]);

  /*
  |--------------------------------------------------------------------------
  | Submit
  |--------------------------------------------------------------------------
  */

  const handleFinish = async (values: DprData) => {
    await onSubmit({
      ...values,

      agentName,
    });

    if (!editingRecord) {
      form.resetFields();

      form.setFieldsValue({
        date: dayjs(),
        agentName,
      });
    }
  };

  return (
    <Card title={editingRecord ? 'Edit DPR' : 'Add DPR'} className="mb-6">
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Row gutter={16}>
          {/* Date */}

          <Col xs={24} md={12}>
            <Form.Item
              label="Date"
              name="date"
              rules={[
                {
                  required: true,
                  message: 'Please select date',
                },
              ]}
            >
              <DatePicker className="w-full" format="DD/MM/YYYY" />
            </Form.Item>
          </Col>

          {/* Agent Name */}

          <Col xs={24} md={12}>
            <Form.Item label="Agent Name" name="agentName">
              <Input placeholder="Agent name" disabled />
            </Form.Item>
          </Col>
        </Row>

        {/* Call Type */}

        <Form.Item
          label="Call Type"
          name="callType"
          rules={[
            {
              required: true,
              message: 'Please select call type',
            },
          ]}
        >
          <Select
            placeholder="Select call type"
            options={[
              {
                label: 'BUFFER CALL',
                value: 'buffer_call',
              },
              {
                label: 'PPC',
                value: 'ppc',
              },
              {
                label: 'EXISTING',
                value: 'existing',
              },
              {
                label: 'EXPEDIA',
                value: 'expedia',
              },
              {
                label: 'META',
                value: 'meta',
              },
            ]}
          />
        </Form.Item>

        {/* META */}

        {callType === 'meta' && (
          <Form.Item
            label="Meta"
            name="meta"
            rules={[
              {
                required: true,
                message: 'Please enter Meta',
              },
            ]}
          >
            <Input placeholder="Enter Meta" size="large" />
          </Form.Item>
        )}

        {/* Phone */}

        <Form.Item
          label="Phone Number"
          name="phoneNumber"
          rules={[
            {
              required: true,
              message: 'Please enter phone number',
            },
          ]}
        >
          <Input placeholder="Enter phone number" />
        </Form.Item>

        {/* Airline */}

        <Form.Item
          label="Airline"
          name="airline"
          rules={[
            {
              required: true,
              message: 'Please enter airline',
            },
          ]}
        >
          <Input placeholder="Enter airline" />
        </Form.Item>

        {/* Call Query */}

        <Form.Item
          label="Call Query"
          name="callQuery"
          rules={[
            {
              required: true,
              message: 'Please select call query',
            },
          ]}
        >
          <Select
            placeholder="Select call query"
            options={[
              {
                label: 'CHANGES',
                value: 'changes',
              },
              {
                label: 'CANCELLATION',
                value: 'cancellation',
              },
              {
                label: 'SHOPPERS CALLS',
                value: 'shoppers_calls',
              },
              {
                label: 'BAGS',
                value: 'bags',
              },
              {
                label: 'SALE',
                value: 'sale',
              },
              {
                label: 'INFORMATION',
                value: 'information',
              },
              {
                label: 'NON AIRLINE',
                value: 'non_airline',
              },
              {
                label: 'NEW BOOKING',
                value: 'new_booking',
              },
              {
                label: 'FOLLOW UP',
                value: 'follow_up',
              },
              {
                label: 'NO VOICE',
                value: 'no_voice',
              },
              {
                label: 'JUNK CALL-SPAM-BLANK-WRONG NUMBER',
                value: 'junk_call_spam_blank_wrong_number',
              },
              {
                label: 'FLIGHT INFORMATION',
                value: 'flight_information',
              },
            ]}
          />
        </Form.Item>

        {/* Notes */}

        <Form.Item
          label="Notes"
          name="notes"
          rules={[
            {
              required: true,
              message: 'Please enter notes',
            },
          ]}
        >
          <TextArea rows={5} placeholder="Enter notes" />
        </Form.Item>

        {/* Buttons */}

        <div className="flex gap-3">
          <Button type="primary" htmlType="submit" disabled={!agentName}>
            {editingRecord ? 'Update DPR' : 'Submit DPR'}
          </Button>

          {editingRecord && <Button onClick={onCancelEdit}>Cancel</Button>}
        </div>
      </Form>
    </Card>
  );
}