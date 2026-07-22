export interface AuthForm {
  _id: string;

  bookingId: {
    _id: string;
    bookingNo: string;

    customer: {
      name: string;
      email: string;
    };
  };

  approval: {
    status: 'draft' | 'sent' | 'opened' | 'submitted' | 'approved' | 'rejected' | 'expired';

    approvedAt?: string;

    approvedBy?: {
      ipAddress?: string;
    };
  };

  email: {
    subject: string;
    to: string;
  };

  bookingType: string;

  serviceType: string;

  createdAt: string;
}
