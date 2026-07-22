export interface Booking {
  id: string;
  customer: string;
  destination: string;
  bookingDate: string;
  amount: number;
  status: 'Confirmed' | 'Pending' | 'Cancelled';
}

export const data: Booking[] = [
  {
    id: '1',
    customer: 'Tarun Kumar',
    destination: 'Goa',
    bookingDate: '11 Jul 2026',
    amount: 25000,
    status: 'Confirmed',
  },
  {
    id: '2',
    customer: 'Rahul Sharma',
    destination: 'Dubai',
    bookingDate: '12 Jul 2026',
    amount: 72000,
    status: 'Pending',
  },
  {
    id: '3',
    customer: 'Priya Verma',
    destination: 'Bali',
    bookingDate: '15 Jul 2026',
    amount: 68000,
    status: 'Confirmed',
  },
  {
    id: '4',
    customer: 'Amit Singh',
    destination: 'Kashmir',
    bookingDate: '18 Jul 2026',
    amount: 18500,
    status: 'Cancelled',
  },
  {
    id: '5',
    customer: 'Neha Patel',
    destination: 'Manali',
    bookingDate: '21 Jul 2026',
    amount: 32000,
    status: 'Pending',
  },
];
