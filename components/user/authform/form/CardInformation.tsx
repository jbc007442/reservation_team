'use client';

import { Button, Card, Col, DatePicker, Form, Input, InputNumber, Radio, Row } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import type { Dayjs } from 'dayjs';

const { TextArea } = Input;

export interface CardInfo {
  cardType: string;
  cardHolderName: string;
  cardNumber: string;
  cvv: string;
  expiryDate: Dayjs | null;
  contactNumber: string;
  amount: number | null;
  billingAddress: string;
}

interface CardInformationProps {
  value: CardInfo[];
  onChange: (cards: CardInfo[]) => void;
}

const defaultCard: CardInfo = {
  cardType: 'visa',
  cardHolderName: '',
  cardNumber: '',
  cvv: '',
  expiryDate: null,
  contactNumber: '',
  amount: null,
  billingAddress: '',
};

export default function CardInformation({ value, onChange }: CardInformationProps) {
  const cards = value.length > 0 ? value : [{ ...defaultCard }];

  const addCard = () => {
    onChange([...cards, { ...defaultCard }]);
  };

  const removeCard = (index: number) => {
    onChange(cards.filter((_, i) => i !== index));
  };

  const updateCard = <K extends keyof CardInfo>(index: number, field: K, value: CardInfo[K]) => {
    onChange(
      cards.map((card, i) =>
        i === index
          ? {
              ...card,
              [field]: value,
            }
          : card
      )
    );
  };

  return (
    <>
      {cards.map((card, index) => (
        <Card
          key={index}
          title={`Card Information ${index + 1}`}
          className="mb-6"
          extra={
            cards.length > 1 && (
              <Button
                danger
                type="text"
                icon={<DeleteOutlined />}
                onClick={() => removeCard(index)}
              >
                Remove
              </Button>
            )
          }
        >
          <Form.Item label="Card Type">
            <Radio.Group
              value={card.cardType}
              onChange={(e) => updateCard(index, 'cardType', e.target.value)}
            >
              <Radio value="master">Master Card</Radio>
              <Radio value="visa">VISA</Radio>
              <Radio value="discover">Discover</Radio>
              <Radio value="amex">AMEX</Radio>
              <Radio value="other">Other</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item label="Card Holder Name">
            <Input
              placeholder="Card Holder Name"
              value={card.cardHolderName}
              onChange={(e) => updateCard(index, 'cardHolderName', e.target.value)}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item label="Card Number">
                <Input
                  placeholder="Card Number"
                  value={card.cardNumber}
                  onChange={(e) => updateCard(index, 'cardNumber', e.target.value)}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item label="CVV Number">
                <Input
                  placeholder="CVV"
                  maxLength={4}
                  value={card.cvv}
                  onChange={(e) => updateCard(index, 'cvv', e.target.value)}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item label="Expiration Date">
                <DatePicker
                  picker="month"
                  className="w-full"
                  format="MMMM YYYY"
                  placeholder="Select Month"
                  value={card.expiryDate}
                  onChange={(date) => updateCard(index, 'expiryDate', date)}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item label="Contact Number">
                <Input
                  placeholder="Contact Number"
                  value={card.contactNumber}
                  onChange={(e) => updateCard(index, 'contactNumber', e.target.value)}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item label="Amount">
                <Input
                  type="number"
                  placeholder="Amount"
                  value={card.amount ?? ''}
                  onChange={(e) =>
                    updateCard(
                      index,
                      'amount',
                      e.target.value === '' ? null : Number(e.target.value)
                    )
                  }
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Billing Address">
            <TextArea
              rows={4}
              placeholder="Billing Address"
              value={card.billingAddress}
              onChange={(e) => updateCard(index, 'billingAddress', e.target.value)}
            />
          </Form.Item>
        </Card>
      ))}

      <Button block type="dashed" icon={<PlusOutlined />} onClick={addCard}>
        Add Another Card
      </Button>
    </>
  );
}
