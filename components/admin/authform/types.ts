export interface Passenger {
  id: string;
  title: string;
  firstName: string;
  lastName: string;
  dob: string;
  passportNumber: string;
  nationality: string;
}

export interface Customer {
  name: string;
  phone: string;
  email: string;
}

export interface Company {
  name: string;
  gst?: string;
}

export interface QueryInfo {
  id: string;
  destination: string;
  fromDate: string;
  toDate: string;
  travelMonth: string;
  leadSource: string;
  services: string;
  adults: number;
  children: number;
  infants: number;
  description: string;
}

export interface AuthorizationForm {
  emailSubject: string;
  customerEmail: string;
  bookingReference: string;
  bookingType: string;
  content: string;
  passengers: Passenger[];
}

export interface TimelineItem {
  id: string;
  title: string;
  user: string;
  date: string;
  status: 'success' | 'warning' | 'info';
}

export interface MailHistoryItem {
  id: string;
  subject: string;
  recipient: string;
  sentAt: string;
  status: 'Sent' | 'Failed' | 'Pending';
}
