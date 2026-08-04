'use client';

import { useState, useEffect } from 'react';
import { Button, Card, Col, Form, Row, Space, message } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';

import EmailInfo from './EmailInfo';
import PassengerSection from './PassengerSection';
import BookingType from './BookingType';
import ServiceType from './ServiceType';
import RichTextEditor from './RichTextEditor';
import BookingDetails from './BookingDetails';
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
  const [bookingImage, setBookingImage] = useState<UploadFile | null>(null);
  const [, setBookingType] = useState<string>();
  const [terms, setTerms] = useState<string>(termsTemplates.Flight);
  const [charges, setCharges] = useState<ChargeItem[]>([]);
  const [cards, setCards] = useState<CardInfo[]>([]);

  const [paymentLocked, setPaymentLocked] = useState(false);
  const totalAmount = charges.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const [loading, setLoading] = useState(false);
  const [authFormId, setAuthFormId] = useState<string | null>(null);
  const customerName = booking.customer.name.trim().split(' ');
  const [selectedFlight, setSelectedFlight] = useState<any>(null);

  const [passengers, setPassengers] = useState<Passenger[]>([
    {
      title: 'Mr.',
      firstName: customerName[0] ?? '',
      middleName: customerName.length > 2 ? customerName.slice(1, -1).join(' ') : '',
      lastName: customerName.length > 1 ? customerName[customerName.length - 1] : '',
      gender: 'Male',
      dob: '',
    },
  ]);

  useEffect(() => {
    console.log('Passengers Changed:', JSON.stringify(passengers, null, 2));
  }, [passengers]);

  const addPassenger = () => {
    setPassengers((prev) => [
      ...prev,
      {
        title: 'Mr.',
        firstName: '',
        middleName: '',
        lastName: '',
        gender: 'Male',
        dob: '',
      },
    ]);
  };

  const removePassenger = (index: number) => {
    setPassengers((prev) => prev.filter((_, i) => i !== index));
  };

  const updatePassenger = (index: number, field: keyof Passenger, value: string | null) => {
    const normalizedValue = value ?? '';

    setPassengers((prev) => {
      const updated = prev.map((passenger, i) =>
        i === index
          ? {
              ...passenger,
              [field]: normalizedValue,
            }
          : passenger
      );

      console.log('Updated Passengers:', updated);

      return updated;
    });
  };

  useEffect(() => {
    loadAuthForm();
  }, []);

  const loadAuthForm = async () => {
    try {
      const res = await fetch(`/api/authform/booking/${booking._id}`);
      const result = await res.json();

      // Existing Auth Form
      if (result.data) {
        console.log('API Response:', result.data);
        setAuthFormId(result.data._id);

        form.setFieldsValue({
          emailSubject: result.data.email?.subject || '',
          customerEmail: booking.customer.email,
          bookingReferenceNo: result.data.bookingReferenceNo,
          metaReferenceNo: result.data.metaReferenceNo || '',
          bookingType: result.data.bookingType,
          serviceType: result.data.serviceType,
        });

        setContent(result.data.content || '');

        // Reset both states first
        setBookingImage(null);
        setSelectedFlight(null);

        // Image booking
        if (result.data.bookingDetailsType === 'image' && result.data.bookingDetails) {
          setBookingImage({
            uid: '-1',
            name: 'booking-detail',
            status: 'done',
            url: result.data.bookingDetails,
          });
        }

        // API itinerary booking
        if (result.data.bookingDetailsType === 'api' && result.data.itineraryData) {
          setSelectedFlight(result.data.itineraryData);
        }

        setTerms(result.data.terms || '');
        setCharges(result.data.charges || []);

        const loadedCards = (result.data.cards || []).map((card: any) => ({
          ...card,
          expiryDate: card.expiryDate ? dayjs(card.expiryDate, 'MM/YYYY') : null,
        }));

        setCards(loadedCards);

        // Lock AuthForm if ALL cards have Transaction ID
        const allTransactionIdsFilled =
          loadedCards.length > 0 &&
          loadedCards.every((card: any) => card.transactionId && card.transactionId.trim() !== '');

        setPaymentLocked(allTransactionIdsFilled);

        const loadedPassengers = (result.data.passengers || []).map((p: any) => ({
          title: p.title,
          firstName: p.firstName,
          middleName: p.middleName || '',
          lastName: p.lastName,
          gender: p.gender || 'Male',
          dob: p.dob ? dayjs(p.dob).toISOString() : '',
        }));

        if (loadedPassengers.length > 0) {
          console.log('Existing Auth Form - Loaded passengers', loadedPassengers);
          setPassengers(loadedPassengers);
        } else {
          setPassengers([
            {
              title: 'Mr.',
              firstName: customerName[0] ?? '',
              middleName: customerName.length > 2 ? customerName.slice(1, -1).join(' ') : '',
              lastName: customerName.length > 1 ? customerName[customerName.length - 1] : '',
              gender: 'Male',
              dob: '',
            },
          ]);
        }
      } else {
        // New Auth Form
        setAuthFormId(null);

        form.setFieldsValue({
          emailSubject: '',
          customerEmail: booking.customer.email,
          bookingReferenceNo: booking.bookingNo,
          metaReferenceNo: '',
          bookingType: undefined,
          serviceType: undefined,
        });

        setContent('');
        setTerms(termsTemplates.Flight);
        setCharges([]);
        setCards([]);
        setPaymentLocked(false);
        console.log('New Auth Form - Creating default passenger');
        setPassengers([
          {
            title: 'Mr.',
            firstName: customerName[0] ?? '',
            middleName: customerName.length > 2 ? customerName.slice(1, -1).join(' ') : '',
            lastName: customerName.length > 1 ? customerName[customerName.length - 1] : '',
            gender: 'Male',
            dob: '',
          },
        ]);
      }
    } catch (err) {
      console.error(err);
      message.error('Failed to load authorization form');
    }
  };

  console.log('Passengers State:', passengers);

  const onFinish = async (values: any) => {
    console.log('===== onFinish Called =====');
    console.log('Passengers State:', passengers);
    try {
      setLoading(true);

      const totalCardAmount = cards.reduce((sum, card) => sum + (Number(card.amount) || 0), 0);

      if (totalCardAmount < totalAmount) {
        message.error(
          `Card total is less than the total charges. Remaining amount: ${
            totalAmount - totalCardAmount
          }`
        );
        setLoading(false);
        return;
      }

      if (totalCardAmount > totalAmount) {
        message.error(
          `Card total cannot exceed the total charges. Exceeded by: ${
            totalCardAmount - totalAmount
          }`
        );
        setLoading(false);
        return;
      }

      const oldBookingImage = bookingImage?.url || '';

      let bookingDetails = '';
      let bookingDetailsType: 'image' | 'api' = 'image';
      let itineraryData: any = null;

      // ===========================
      // IMAGE MODE
      // ===========================
      if (bookingImage) {
        bookingDetailsType = 'image';
        itineraryData = null;

        // New image uploaded
        if (bookingImage.originFileObj) {
          const formData = new FormData();

          formData.append('file', bookingImage.originFileObj as File);
          formData.append('folder', 'authform/booking-detail');
          formData.append('bookingId', booking._id);
          formData.append('bookingNo', booking.bookingNo);

          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });

          if (!uploadResponse.ok) {
            throw new Error('Failed to upload booking image');
          }

          const uploadResult = await uploadResponse.json();

          bookingDetails = uploadResult.url;
        } else {
          // Existing image
          bookingDetails = oldBookingImage;
        }
      }

      // ===========================
      // ITINERARY MODE
      // ===========================
      else if (selectedFlight) {
        bookingDetailsType = 'api';
        itineraryData = selectedFlight;
        bookingDetails = '';

        // Delete old uploaded image
        if (oldBookingImage) {
          await fetch('/api/upload', {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              url: oldBookingImage,
              folder: 'authform/booking-detail',
            }),
          });
        }
      }

      console.log('Booking Image:', bookingImage);
      console.log('Selected Flight:', selectedFlight);
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

        // passengers: passengers
        //   .filter((p) => p.title && p.firstName.trim() && p.lastName.trim() && p.gender && p.dob)
        //   .map((p) => ({
        //     title: p.title,
        //     firstName: p.firstName,
        //     middleName: p.middleName,
        //     lastName: p.lastName,
        //     gender: p.gender,
        //     dob: new Date(p.dob!),
        //   })),

        passengers: passengers
          .filter((p) => p.title && p.firstName.trim() && p.lastName.trim() && p.gender)
          .map((p) => ({
            title: p.title,
            firstName: p.firstName,
            middleName: p.middleName,
            lastName: p.lastName,
            gender: p.gender,
            dob: p.dob ? new Date(p.dob) : null,
          })),

        content,
        terms,

        bookingDetails,
        bookingDetailsType,
        itineraryData,

        charges,

        cards: cards.map((card) => ({
          ...card,
          expiryDate: card.expiryDate ? card.expiryDate.format('MM/YYYY') : '',
        })),
      };
      console.log('Payload:', payload);
      console.log('Payload Passengers:', payload.passengers);

      console.log('Selected Flight', selectedFlight);
      console.log('Payload', payload);
      console.log('Passengers State:', passengers);
      console.log('Payload Passengers:', payload.passengers);

      const url = authFormId ? `/api/authform/${authFormId}` : '/api/authform';

      const method = authFormId ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
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

      if (!authFormId) {
        setAuthFormId(result.data._id);
      }

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
          <RichTextEditor
            label="Content"
            value={content}
            onChange={setContent}
            folder="authform/email-content"
          />

          <div style={{ marginTop: 24 }}>
            <BookingDetails
              booking={booking}
              value={bookingImage}
              onChange={setBookingImage}
              selectedFlight={selectedFlight}
              onFlightSelect={setSelectedFlight}
            />
          </div>
        </Card>

        <Charges value={charges} onChange={setCharges} />

        <CardInformation value={cards} onChange={setCards} totalAmount={totalAmount} />

        <TermsConditions value={terms} onChange={setTerms} />

        <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
          <Row justify="end">
            <Space>
              <Button onClick={handleCancel}>Cancel</Button>

              <Button type="primary" htmlType="submit" loading={loading} disabled={paymentLocked}>
                {loading
                  ? 'Saving...'
                  : paymentLocked
                    ? 'Payment Verified'
                    : authFormId
                      ? 'Update'
                      : 'Save'}
              </Button>
            </Space>
          </Row>
        </Form.Item>
      </Form>
    </Card>
  );
}
