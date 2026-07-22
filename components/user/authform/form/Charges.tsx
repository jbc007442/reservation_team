'use client';

import { Button, Card, Col, Input, InputNumber, Row, Select, Typography } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';

const { Text } = Typography;

export interface ChargeItem {
  description: string;
  amount: number | null;
  currency: string;
}

interface ChargesProps {
  value: ChargeItem[];
  onChange: (items: ChargeItem[]) => void;
}

export default function Charges({ value, onChange }: ChargesProps) {
  const items =
    value.length > 0
      ? value
      : [
          {
            description: '',
            amount: null,
            currency: 'USD',
          },
        ];

  const addItem = () => {
    onChange([
      ...items,
      {
        description: '',
        amount: null,
        currency: items[0]?.currency || 'USD',
      },
    ]);
  };

  const removeItem = (itemIndex: number) => {
    onChange(items.filter((_, idx) => idx !== itemIndex));
  };

  const updateItem = (
    itemIndex: number,
    field: keyof ChargeItem,
    value: ChargeItem[keyof ChargeItem]
  ) => {
    const updatedItems = items.map((item, idx) =>
      idx === itemIndex
        ? {
            ...item,
            [field]: value,
          }
        : item
    );

    console.log('Updated Items:', updatedItems);

    onChange(updatedItems);
  };

  const total = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  return (
    <Card className="mb-6" title="Charges">
      {/* Header */}
      <Row gutter={12} className="mb-2 rounded-md bg-gray-100 px-3 py-2 font-semibold">
        <Col span={12}>Description</Col>
        <Col span={5}>Amount</Col>
        <Col span={4}>Currency</Col>
        <Col span={3} className="text-center">
          Action
        </Col>
      </Row>

      {/* Items */}
      {items.map((item, itemIndex) => (
        <Row gutter={12} key={itemIndex} align="middle" className="mb-3">
          <Col span={12}>
            <Input
              placeholder="Delta Airlines / Taxes / Meals"
              value={item.description}
              onChange={(e) => updateItem(itemIndex, 'description', e.target.value)}
            />
          </Col>

          <Col span={5}>
            <InputNumber
              className="w-full"
              min={0}
              placeholder="0.00"
              value={item.amount}
              onChange={(value) => updateItem(itemIndex, 'amount', value)}
            />
          </Col>

          <Col span={4}>
            <Select
              value={item.currency}
              onChange={(value) => updateItem(itemIndex, 'currency', value)}
              options={[
                { label: 'USD', value: 'USD' },
                { label: 'INR', value: 'INR' },
                { label: 'AED', value: 'AED' },
                { label: 'EUR', value: 'EUR' },
              ]}
            />
          </Col>

          <Col span={3} className="text-center">
            {items.length > 1 && (
              <Button danger icon={<DeleteOutlined />} onClick={() => removeItem(itemIndex)} />
            )}
          </Col>
        </Row>
      ))}

      <Button type="dashed" icon={<PlusOutlined />} onClick={addItem}>
        Add Charge
      </Button>

      <div className="mt-6 rounded-lg border bg-gray-50 p-4">
        <Row justify="space-between" align="middle">
          <Text strong>Total Charges</Text>

          <Text strong className="text-lg text-green-600">
            {total.toFixed(2)} {items[0]?.currency || 'USD'}
          </Text>
        </Row>
      </div>
    </Card>
  );
}
