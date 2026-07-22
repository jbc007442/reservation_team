import { Booking } from '@/components/admin/booking/types';

export interface Passenger {
  title: string;
  firstName: string;
  lastName: string;
  gender: 'Male' | 'Female' | 'Other';
  dob: string | null;
}

export interface RichTextEditorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  height?: number;
}

export interface PassengerSectionProps {
  booking: Booking;
  passengers: Passenger[];
  addPassenger: () => void;
  removePassenger: (index: number) => void;
  updatePassenger: (index: number, field: keyof Passenger, value: string | null) => void;
}

export interface BookingTypeProps {
  booking: Booking;
  bookingType?: string;
  setBookingType: React.Dispatch<React.SetStateAction<string | undefined>>;
  setTerms: React.Dispatch<React.SetStateAction<string>>;
}

export interface TermsConditionsProps {
  value: string;
  onChange: (value: string) => void;
}
