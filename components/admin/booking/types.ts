export type BookingStatus =
  | 'booking_created'
  | 'auth_pending'
  | 'auth_completed'
  | 'ticketed'
  | 'cancelled'
  | 'refunded'
  | 'charge_back'
  | 'follow_up'
  | 'card_charged'
  | 'card_decline';

export type BookingService =
  | 'Package'
  | 'Flight'
  | 'Hotel'
  | 'Hotel + Flight'
  | 'Cargo'
  | 'Pet'
  | 'Car'
  | 'Cruise'
  | 'Amtrak'
  | 'Other';

export type CallType = 'Buffer' | 'PPC' | 'Meta' | 'Other';

export type SaleType = 'fresh' | 'repeat' | 'referral';

export interface Booking {
  _id: string;
  bookingNo: string;

  customer: {
    title?: string;
    name: string;
    mobile: string;
    email?: string;
  };

  journey: {
    fromCity: string;
    toCity: string;
    departureDate: string;
    returnDate?: string;
    adults: number;
    children: number;
    infants: number;
  };

  service: BookingService;

  callType?: CallType;

  websites?: string[];

  saleType?: SaleType;

  remark?: string;

  status: BookingStatus;

  assignedTo?: {
    _id: string;
    name: string;
    employeeId: string;
  };

  createdBy?: {
    _id: string;
    name: string;
    employeeId: string;
  };

  createdAt: string;
  updatedAt: string;
}