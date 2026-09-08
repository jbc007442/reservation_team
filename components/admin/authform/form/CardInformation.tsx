'use client';

import { useEffect } from 'react';
import dayjs, { type Dayjs } from 'dayjs';

import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Radio,
  Row,
  message,
} from 'antd';

import {
  DeleteOutlined,
  PlusOutlined,
} from '@ant-design/icons';

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

export default function CardInformation({
  value,
  onChange,
  totalAmount,
}: CardInformationProps) {
  const [form] = Form.useForm();

  const cards =
    value.length > 0
      ? value
      : [
          {
            ...defaultCard,
            amount: totalAmount,
          },
        ];

  useEffect(() => {
    if (value.length === 0) return;

    if (value[0]?.amount === totalAmount) return;

    const updatedCards = value.map((card, index) =>
      index === 0
        ? {
            ...card,
            amount: totalAmount,
          }
        : card
    );

    onChange(updatedCards);
  }, [totalAmount]);

  useEffect(() => {
    cards.forEach((card, index) => {
      form.setFieldsValue({
        [`card_${index}`]: {
          cardType: card.cardType,
          paymentLink: card.paymentLink,
          cardHolderName: card.cardHolderName,
          cardNumber: card.cardNumber,
          cvv: card.cvv,
          expiryDate: card.expiryDate,
          contactNumber: card.contactNumber,
          amount: card.amount,
          billingAddress: card.billingAddress,
        },
      });
    });
  }, [value, totalAmount]);

  const syncField = (
    index: number,
    field: keyof CardInfo,
    fieldValue: CardInfo[keyof CardInfo]
  ) => {
    form.setFieldValue(
      ['card_' + index, field],
      fieldValue
    );

    form.validateFields([
      ['card_' + index, field],
    ]).catch(() => {});
  };

  const addCard = () => {
    const newCards = [
      ...cards,
      {
        ...defaultCard,
        amount: 0,
      },
    ];

    onChange(newCards);

    setTimeout(() => {
      form.setFieldsValue({
        [`card_${newCards.length - 1}`]: {
          ...defaultCard,
          amount: 0,
        },
      });
    }, 0);
  };

  const removeCard = (index: number) => {
    const updatedCards = value.filter(
      (_, i) => i !== index
    );

    onChange(updatedCards);
    form.resetFields();
  };

  const updateCard = <K extends keyof CardInfo>(
    index: number,
    field: K,
    fieldValue: CardInfo[K]
  ) => {
    let updatedCards = cards.map((card, i) =>
      i === index
        ? {
            ...card,
            [field]: fieldValue,
          }
        : card
    );

    if (field === 'cardType') {
      if (fieldValue === 'other') {
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
          cardType: String(fieldValue),
          paymentLink: '',
        };
      }
    }

    if (field === 'amount') {
      const enteredAmount = Number(fieldValue) || 0;

      if (enteredAmount > totalAmount) {
        message.error(
          `Amount cannot exceed ${totalAmount}`
        );
        return;
      }

      if (enteredAmount < 0) {
        message.error('Amount cannot be negative');
        return;
      }

      if (
        updatedCards.length > 1 &&
        index !== 0
      ) {
        const otherTotal =
          updatedCards.reduce(
            (sum, card, i) => {
              if (i === 0) return sum;

              return (
                sum +
                (Number(card.amount) || 0)
              );
            },
            0
          );

        updatedCards[0] = {
          ...updatedCards[0],
          amount: Math.max(
            totalAmount - otherTotal,
            0
          ),
        };
      }
    }

    onChange(updatedCards);

    syncField(
      index,
      field,
      fieldValue
    );
  };

  const cardTypeRules = [
    {
      required: true,
      message: 'Please select card type',
    },
  ];

  const paymentLinkRules = [
    {
      required: true,
      whitespace: true,
      message: 'Please enter payment link',
    },
    {
      validator: async (
        _: unknown,
        link: string
      ) => {
        if (!link) return;

        try {
          new URL(link);
        } catch {
          throw new Error(
            'Please enter a valid payment link'
          );
        }
      },
    },
  ];

  const cardHolderRules = [
    {
      required: true,
      whitespace: true,
      message:
        'Please enter card holder name',
    },
  ];

  const cardNumberRules = [
    {
      required: true,
      message: 'Please enter card number',
    },
    {
      validator: async (
        _: unknown,
        cardNumber: string
      ) => {
        if (!cardNumber) return;

        const cleanNumber =
          cardNumber.replace(/\s/g, '');

        if (
          !/^\d{12,19}$/.test(
            cleanNumber
          )
        ) {
          throw new Error(
            'Card number must contain 12-19 digits'
          );
        }
      },
    },
  ];

  const cvvRules = [
    {
      required: true,
      message: 'Please enter CVV',
    },
    {
      pattern: /^\d{3,4}$/,
      message: 'CVV must be 3-4 digits',
    },
  ];

  const expiryRules = [
    {
      required: true,
      message:
        'Please select expiration date',
    },
    {
      validator: async (
        _: unknown,
        expiryDate: Dayjs | null
      ) => {
        if (!expiryDate) return;

        if (
          expiryDate
            .endOf('month')
            .isBefore(dayjs(), 'month')
        ) {
          throw new Error(
            'Expiration date cannot be in the past'
          );
        }
      },
    },
  ];

  const contactRules = [
    {
      required: true,
      message:
        'Please enter contact number',
    },
    {
      pattern:
        /^[0-9+\-\s()]{7,20}$/,
      message:
        'Please enter a valid contact number',
    },
  ];

  const amountRules = [
    {
      required: true,
      message: 'Please enter amount',
    },
    {
      validator: async (
        _: unknown,
        amount: number | null
      ) => {
        if (
          amount === null ||
          amount === undefined
        ) {
          return;
        }

        if (amount < 0) {
          throw new Error(
            'Amount cannot be negative'
          );
        }

        if (amount > totalAmount) {
          throw new Error(
            `Amount cannot exceed ${totalAmount}`
          );
        }
      },
    },
  ];

  const billingRules = [
    {
      required: true,
      whitespace: true,
      message:
        'Please enter billing address',
    },
  ];

  return (
    <Form
      form={form}
      layout="vertical"
      validateTrigger={['onChange', 'onBlur']}
    >
      {cards.map((card, index) => {
        const formKey = `card_${index}`;

        return (
          <Card
            key={formKey}
            title={`Card Information ${
              index + 1
            }`}
            className="mb-6"
            extra={
              cards.length > 1 && (
                <Button
                  danger
                  type="text"
                  icon={
                    <DeleteOutlined />
                  }
                  onClick={() =>
                    removeCard(index)
                  }
                >
                  Remove
                </Button>
              )
            }
          >
            <Form.Item
              label="Card Type"
              name={[
                formKey,
                'cardType',
              ]}
              rules={cardTypeRules}
            >
              <Radio.Group
                value={card.cardType}
                onChange={(e) =>
                  updateCard(
                    index,
                    'cardType',
                    e.target.value
                  )
                }
              >
                <Radio value="master">
                  Master Card
                </Radio>

                <Radio value="visa">
                  VISA
                </Radio>

                <Radio value="discover">
                  Discover
                </Radio>

                <Radio value="amex">
                  AMEX
                </Radio>

                <Radio value="other">
                  Other
                </Radio>
              </Radio.Group>
            </Form.Item>

            {card.cardType === 'other' ? (
              <Form.Item
                label="Payment Link"
                name={[
                  formKey,
                  'paymentLink',
                ]}
                rules={paymentLinkRules}
              >
                <Input
                  placeholder="https://payment-link.com"
                  value={
                    card.paymentLink
                  }
                  onChange={(e) =>
                    updateCard(
                      index,
                      'paymentLink',
                      e.target.value
                    )
                  }
                />
              </Form.Item>
            ) : (
              <>
                <Form.Item
                  label="Card Holder Name"
                  name={[
                    formKey,
                    'cardHolderName',
                  ]}
                  rules={
                    cardHolderRules
                  }
                >
                  <Input
                    placeholder="Card Holder Name"
                    value={
                      card.cardHolderName
                    }
                    onChange={(e) =>
                      updateCard(
                        index,
                        'cardHolderName',
                        e.target.value
                      )
                    }
                  />
                </Form.Item>

                <Row gutter={16}>
                  <Col
                    xs={24}
                    md={8}
                  >
                    <Form.Item
                      label="Card Number"
                      name={[
                        formKey,
                        'cardNumber',
                      ]}
                      rules={
                        cardNumberRules
                      }
                    >
                      <Input
                        placeholder="Card Number"
                        value={
                          card.cardNumber
                        }
                        onChange={(e) =>
                          updateCard(
                            index,
                            'cardNumber',
                            e.target.value
                          )
                        }
                      />
                    </Form.Item>
                  </Col>

                  <Col
                    xs={24}
                    md={8}
                  >
                    <Form.Item
                      label="CVV Number"
                      name={[
                        formKey,
                        'cvv',
                      ]}
                      rules={cvvRules}
                    >
                      <Input
                        placeholder="CVV"
                        maxLength={4}
                        inputMode="numeric"
                        value={card.cvv}
                        onChange={(e) =>
                          updateCard(
                            index,
                            'cvv',
                            e.target.value.replace(
                              /\D/g,
                              ''
                            )
                          )
                        }
                      />
                    </Form.Item>
                  </Col>

                  <Col
                    xs={24}
                    md={8}
                  >
                    <Form.Item
                      label="Expiration Date"
                      name={[
                        formKey,
                        'expiryDate',
                      ]}
                      rules={expiryRules}
                    >
                      <DatePicker
                        picker="month"
                        className="w-full"
                        format="MM/YYYY"
                        placeholder="MM/YYYY"
                        value={
                          card.expiryDate
                        }
                        disabledDate={(
                          current
                        ) =>
                          current
                            .endOf(
                              'month'
                            )
                            .isBefore(
                              dayjs(),
                              'month'
                            )
                        }
                        onChange={(date) =>
                          updateCard(
                            index,
                            'expiryDate',
                            date
                          )
                        }
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </>
            )}

            <Row gutter={16}>
              <Col
                xs={24}
                md={12}
              >
                <Form.Item
                  label="Contact Number"
                  name={[
                    formKey,
                    'contactNumber',
                  ]}
                  rules={contactRules}
                >
                  <Input
                    placeholder="Contact Number"
                    value={
                      card.contactNumber
                    }
                    onChange={(e) =>
                      updateCard(
                        index,
                        'contactNumber',
                        e.target.value
                      )
                    }
                  />
                </Form.Item>
              </Col>

              <Col
                xs={24}
                md={12}
              >
                <Form.Item
                  label="Amount"
                  name={[
                    formKey,
                    'amount',
                  ]}
                  rules={amountRules}
                >
                  <InputNumber
                    className="w-full"
                    min={0}
                    max={totalAmount}
                    placeholder="Amount"
                    value={card.amount}
                    onChange={(amount) =>
                      updateCard(
                        index,
                        'amount',
                        amount === null
                          ? null
                          : Number(amount)
                      )
                    }
                  />
                </Form.Item>
              </Col>
            </Row>

            {card.cardType !== 'other' && (
              <Form.Item
                label="Billing Address"
                name={[
                  formKey,
                  'billingAddress',
                ]}
                rules={billingRules}
              >
                <TextArea
                  rows={4}
                  placeholder="Billing Address"
                  value={
                    card.billingAddress
                  }
                  onChange={(e) =>
                    updateCard(
                      index,
                      'billingAddress',
                      e.target.value
                    )
                  }
                />
              </Form.Item>
            )}
          </Card>
        );
      })}

      <Button
        block
        type="dashed"
        icon={<PlusOutlined />}
        onClick={addCard}
      >
        Add Another Card
      </Button>
    </Form>
  );
}

