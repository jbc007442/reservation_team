export interface ReportData {
  key: string;

  bookingNo: string;

  customerName: string;

  service: string;

  serviceType: string;

  amount: number;

  approvedAmount: number;

  pendingAmount: number;

  merchant: string;

  paymentStatus: 'pending' | 'partial' | 'paid';

  status:
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

  createdBy: string;

  createdAt: string;

  updatedAt?: string;
}
