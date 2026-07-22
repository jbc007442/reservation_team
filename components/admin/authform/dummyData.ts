import type {
  AuthorizationForm,
  Company,
  Customer,
  MailHistoryItem,
  QueryInfo,
  TimelineItem,
} from './types';

export const queryInfo: QueryInfo = {
  id: '100012',
  destination: 'Delhi',
  fromDate: '14 Jul 2026',
  toDate: '16 Jul 2026',
  travelMonth: 'July',
  leadSource: 'Akbar Travels',
  services: 'Flight Only',
  adults: 1,
  children: 0,
  infants: 0,
  description: 'NEW FLIGHTS TEST',
};

export const customer: Customer = {
  name: 'Mr. Chaman',
  phone: '085525577',
  email: 'bookmytrvl@gmail.com',
};

export const authForm: AuthorizationForm = {
  emailSubject: 'NEW BOOKING',
  customerEmail: 'bookmytrvl@gmail.com',
  bookingReference: 'PENDING',
  bookingType: '',
  content: `Greetings for the day,

Thank you for choosing us as your trusted travel partner.

Please verify all passenger details before confirming your booking.

Regards,
TravelCRM Team`,
  passengers: [
    {
      id: '1',
      title: 'Mr',
      firstName: 'Chaman',
      lastName: 'Kumar',
      dob: '04 Jul 2012',
      passportNumber: 'N1234567',
      nationality: 'Indian',
    },
  ],
};

export const timeline: TimelineItem[] = [
  {
    id: '1',
    title: 'Booking Created',
    user: 'Admin',
    date: '12 Jul 2026 12:02 AM',
    status: 'success',
  },
  {
    id: '2',
    title: 'Authorization Email Sent',
    user: 'Admin',
    date: '12 Jul 2026 12:05 AM',
    status: 'info',
  },
  {
    id: '3',
    title: 'Customer Approved',
    user: 'Customer',
    date: '12 Jul 2026 12:08 AM',
    status: 'success',
  },
];

export const mailHistory: MailHistoryItem[] = [
  {
    id: '1',
    subject: 'Booking Authorization',
    recipient: 'bookmytrvl@gmail.com',
    sentAt: '12 Jul 2026 12:05 AM',
    status: 'Sent',
  },
  {
    id: '2',
    subject: 'Reminder',
    recipient: 'bookmytrvl@gmail.com',
    sentAt: '12 Jul 2026 02:30 PM',
    status: 'Pending',
  },
];
