'use client';

import { useState } from 'react';
import { Button, Card, Col, Form, Row, Space, message } from 'antd';

import EmailInfo from './EmailInfo';
import PassengerSection from './PassengerSection';
import BookingType from './BookingType';
import ServiceType from './ServiceType';
import RichTextEditor from './RichTextEditor';
import Charges, { ChargeItem } from './Charges';
import CardInformation, { CardInfo } from './CardInformation';
import TermsConditions from './TermsConditions';

import { Passenger } from './types';
import { termsTemplates } from './constants';
import { Booking } from '@/components/user/booking/types';

import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

interface AuthFormProps {
  booking: Booking;
}

export default function AuthForm({ booking }: AuthFormProps) {
  const [form] = Form.useForm();

  const [content, setContent] = useState('');
  const [bookingDetails, setBookingDetails] = useState('');
  const [, setBookingType] = useState<string>();
  const [terms, setTerms] = useState<string>(termsTemplates.Flight);
  const [charges, setCharges] = useState<ChargeItem[]>([]);
  const [cards, setCards] = useState<CardInfo[]>([]);
  const [loading, setLoading] = useState(false);

 const [passengers, setPassengers] = useState<Passenger[]>([
   {
     title: 'Mr.',
     firstName: '',
     lastName: '',
     dob: '',
   },
 ]);

 const addPassenger = () => {
   setPassengers((prev) => [
     ...prev,
     {
       title: 'Mr.',
       firstName: '',
       lastName: '',
       dob: '',
     },
   ]);
 };

 const removePassenger = (index: number) => {
   setPassengers((prev) => prev.filter((_, i) => i !== index));
 };

 const updatePassenger = (index: number, field: keyof Passenger, value: string) => {
   setPassengers((prev) =>
     prev.map((passenger, i) =>
       i === index
         ? {
             ...passenger,
             [field]: value,
           }
         : passenger
     )
   );
 };

  const onFinish = async (values: any) => {
    try {
      setLoading(true);

      const payload = {
        bookingId: booking._id,
        bookingNo: booking.bookingNo,

        email: {
          subject: values.emailSubject,
        },

        bookingReferenceNo: values.bookingReferenceNo,
        metaReferenceNo: values.metaReferenceNo,

        bookingType: values.bookingType,
        serviceType: values.serviceType,

        passengers: passengers
          .filter((p) => p.title && p.firstName.trim() && p.lastName.trim() && p.dob)
          .map((p) => ({
            ...p,
            dob: dayjs(p.dob, 'DD-MM-YYYY').toDate(),
          })),

        content,
        bookingDetails,
        terms,

        charges,
        cards: cards.map((card) => ({
          ...card,
          expiryDate: card.expiryDate ? card.expiryDate.format('MM/YYYY') : '',
        })),
      };

      const response = await fetch('/api/authform', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message);
      }

      message.success(result.message);

      console.log(result);
    } catch (error: any) {
      message.error(error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setContent('');
    setBookingDetails('');
    setTerms(termsTemplates.Flight);
  };

  return (
    <Card title="Email Authentication">
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <EmailInfo booking={booking} />

        <PassengerSection
          booking={booking}
          passengers={passengers}
          addPassenger={addPassenger}
          removePassenger={removePassenger}
          updatePassenger={updatePassenger}
        />

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <BookingType booking={booking} setBookingType={setBookingType} setTerms={setTerms} />
          </Col>

          <Col xs={24} md={12}>
            <ServiceType />
          </Col>
        </Row>

        <Card size="small" title="Email Content" style={{ marginTop: 16, marginBottom: 16 }}>
          <RichTextEditor label="Content" value={content} onChange={setContent} />

          <div style={{ marginTop: 24 }}>
            <RichTextEditor
              label="Booking Details"
              value={bookingDetails}
              onChange={setBookingDetails}
            />
          </div>
        </Card>

        <Charges value={charges} onChange={setCharges} />

        <CardInformation value={cards} onChange={setCards} />

        <TermsConditions value={terms} onChange={setTerms} />

        <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
          <Row justify="end">
            <Space>
              <Button onClick={handleCancel}>Cancel</Button>

              <Button type="primary" htmlType="submit" loading={loading}>
                Save
              </Button>
            </Space>
          </Row>
        </Form.Item>
      </Form>
    </Card>
  );
}
