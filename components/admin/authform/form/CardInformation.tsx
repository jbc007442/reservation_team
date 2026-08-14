'use client';
import { useEffect } from 'react';

import { Button, Card, Col, DatePicker, Form, Input, InputNumber, Radio, Row, message } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import type { Dayjs } from 'dayjs';

const { TextArea } = Input;

export interface CardInfo {
  cardType: string;
  paymentLink: string;
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
  totalAmount: number;
}

const defaultCard: CardInfo = {
  cardType: 'visa',
  paymentLink: '',
  cardHolderName: '',
  cardNumber: '',
  cvv: '',
  expiryDate: null,
  contactNumber: '',
  amount: null,
  billingAddress: '',
};

export default function CardInformation({ value, onChange, totalAmount }: CardInformationProps) {
  const cards = value.length > 0 ? value : [{ ...defaultCard }];

  useEffect(() => {
    if (cards.length === 0) return;

    const updatedCards = cards.map((card, index) =>
      index === 0
        ? {
            ...card,
            amount: totalAmount,
          }
        : card
    );

    // Prevent infinite loop
    if (cards[0]?.amount !== totalAmount) {
      onChange(updatedCards);
    }
  }, [totalAmount]);

  const addCard = () => {
    onChange([
      ...cards,
      {
        ...defaultCard,
        amount: 0,
      },
    ]);
  };

  const removeCard = (index: number) => {
    onChange(cards.filter((_, i) => i !== index));
  };

  const updateCard = <K extends keyof CardInfo>(index: number, field: K, value: CardInfo[K]) => {
    let updatedCards = cards.map((card, i) =>
      i === index
        ? {
            ...card,
            [field]: value,
          }
        : card
    );

    // Handle Card Type change
    if (field === 'cardType') {
      if (value === 'other') {
        updatedCards[index] = {
          ...updatedCards[index],
          cardType: 'other',
          paymentLink: '',
          cardHolderName: '',
          cardNumber: '',
          cvv: '',
          expiryDate: null,
          billingAddress: '',
        };
      } else {
        updatedCards[index] = {
          ...updatedCards[index],
          cardType: String(value),
          paymentLink: '',
        };
      }
    }

    // Handle Amount change
    if (field === 'amount') {
      const enteredAmount = Number(value) || 0;

      if (enteredAmount > totalAmount) {
        message.error(`Amount cannot exceed ${totalAmount}`);
        return;
      }

      if (updatedCards.length > 1) {
        const otherTotal = updatedCards.reduce((sum, card, i) => {
          if (i === 0) return sum;

          return sum + (Number(card.amount) || 0);
        }, 0);

        updatedCards[0] = {
          ...updatedCards[0],
          amount: Math.max(totalAmount - otherTotal, 0),
        };
      }
    }

    onChange(updatedCards);
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

          {card.cardType === 'other' ? (
            <Form.Item label="Payment Link">
              <Input
                placeholder="https://payment-link.com"
                value={card.paymentLink}
                onChange={(e) => updateCard(index, 'paymentLink', e.target.value)}
              />
            </Form.Item>
          ) : (
            <>
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
                      format="MM/YYYY"
                      placeholder="MM/YYYY"
                      value={card.expiryDate}
                      onChange={(date) => updateCard(index, 'expiryDate', date)}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </>
          )}

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
                <InputNumber
                  className="w-full"
                  min={0}
                  placeholder="Amount"
                  value={card.amount}
                  onChange={(value) =>
                    updateCard(index, 'amount', value === null ? null : Number(value))
                  }
                />
              </Form.Item>
            </Col>
          </Row>

          {card.cardType !== 'other' && (
            <Form.Item label="Billing Address">
              <TextArea
                rows={4}
                placeholder="Billing Address"
                value={card.billingAddress}
                onChange={(e) => updateCard(index, 'billingAddress', e.target.value)}
              />
            </Form.Item>
          )}
        </Card>
      ))}

      <Button block type="dashed" icon={<PlusOutlined />} onClick={addCard}>
        Add Another Card
      </Button>
    </>
  );
}
