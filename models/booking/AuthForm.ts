import mongoose, { Document, Model, Schema } from 'mongoose';

/* ---------------- Passenger ---------------- */

const PassengerSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
    },

    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: true,
      default: 'Male',
    },

    dob: {
      type: Date,
      required: true,
    },
  },
  { _id: false }
);

/* ---------------- Charge ---------------- */

const ChargeSchema = new Schema(
  {
    description: String,
    amount: Number,
    currency: {
      type: String,
      default: 'USD',
    },
  },
  { _id: false }
);

/* ---------------- Card ---------------- */

const CardSchema = new Schema(
  {
    cardType: String,
    cardHolderName: String,
    cardNumber: String,
    expiryDate: String,
    cvv: String,
    amount: Number,
    transactionId: { type: String, default: '', trim: true },
    paymentStatus: { type: String, enum: ['Pending', 'Approved'], default: 'Pending' },
    paymentDate: { type: Date, default: null },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    verifiedAt: { type: Date, default: null },
    contactNumber: String,
    billingAddress: String,
  },
  { _id: false }
);
/* ---------------- Mail ---------------- */

const MailHistorySchema = new Schema(
  {
    to: String,

    subject: String,

    status: {
      type: String,
      enum: ['draft', 'sent', 'delivered', 'opened', 'failed'],
      default: 'draft',
    },

    messageId: String,

    provider: String,

    error: String,

    sentAt: Date,

    deliveredAt: Date,

    openedAt: Date,
  },
  { _id: false }
);

/* ---------------- Notes ---------------- */

const NoteSchema = new Schema(
  {
    note: {
      type: String,
      required: true,
      trim: true,
    },

    title: {
      type: String,
      default: '',
      trim: true,
    },

    type: {
      type: String,
      enum: ['note', 'follow_up', 'warning', 'system'],
      default: 'note',
    },

    visibility: {
      type: String,
      enum: ['internal', 'customer'],
      default: 'internal',
    },

    addedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },

    isPinned: {
      type: Boolean,
      default: false,
    },

    isResolved: {
      type: Boolean,
      default: false,
    },

    attachment: {
      fileName: String,
      fileUrl: String,
      mimeType: String,
      fileSize: Number,
    },

    updatedAt: Date,

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

/* ---------------- Timeline ---------------- */

const TimelineSchema = new Schema(
  {
    action: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: '',
      trim: true,
    },

    performedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    source: {
      type: String,
      enum: ['system', 'customer', 'staff'],
      default: 'system',
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

export interface IAuthForm extends Document {
  bookingId: mongoose.Types.ObjectId;

  email: {
    subject: string;
    to: string;
    cc?: string[];
    bcc?: string[];
    html: string;

    lastSentAt?: Date;

    sendCount?: number;
  };

  bookingReferenceNo: string;

  metaReferenceNo?: string;

  passengers: unknown[];

  bookingType: string;

  serviceType: string;

  content: string;

  bookingDetails: string;

  charges: unknown[];

  cards: unknown[];

  billing: {
    invoiceNo: string;
    subtotal: number;
    tax: number;
    total: number;
    currency: string;
    paymentStatus: 'pending' | 'partial' | 'paid';
  };

  terms: string;

  approval: {
    status: 'draft' | 'sent' | 'opened' | 'submitted' | 'approved' | 'rejected' | 'expired';

    token?: string;

    tokenExpiresAt?: Date;

    sentAt?: Date;

    openedAt?: Date;

    submittedAt?: Date;

    approvedAt?: Date;

    rejectedAt?: Date;

    approvedBy?: {
      name?: string;
      email?: string;
      ipAddress?: string;
      userAgent?: string;
      browser?: string;
      os?: string;
      device?: string;
      country?: string;
    };

    remarks?: string;
  };

  mailHistory: unknown[];

  notes: unknown[];

  timeline: unknown[];
}

const AuthFormSchema = new Schema<IAuthForm>(
  {
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      unique: true,
    },

    email: {
      subject: String,

      to: String,

      cc: [String],

      bcc: [String],

      html: String,

      lastSentAt: Date,

      sendCount: {
        type: Number,
        default: 0,
      },
    },

    bookingReferenceNo: String,

    metaReferenceNo: {
      type: String,
      default: '',
    },

    passengers: [PassengerSchema],

    bookingType: String,

    serviceType: String,

    content: String,

    bookingDetails: String,

    charges: [ChargeSchema],

    cards: [CardSchema],

    billing: {
      invoiceNo: String,
      subtotal: Number,
      tax: Number,
      total: Number,
      currency: {
        type: String,
        default: 'USD',
      },

      paymentStatus: {
        type: String,
        enum: ['pending', 'partial', 'paid'],
        default: 'pending',
      },
    },

    terms: String,

    approval: {
      status: {
        type: String,
        enum: ['draft', 'sent', 'opened', 'submitted', 'approved', 'rejected', 'expired'],
        default: 'draft',
      },

      token: {
        type: String,
        unique: true,
        sparse: true,
      },

      tokenExpiresAt: Date,

      sentAt: Date,

      openedAt: Date,

      submittedAt: Date,

      approvedAt: Date,

      rejectedAt: Date,

      approvedBy: {
        name: String,
        email: String,

        ipAddress: String,

        userAgent: String,

        browser: String,

        os: String,

        device: String,

        country: String,
      },

      remarks: String,
    },

    mailHistory: [MailHistorySchema],

    notes: [NoteSchema],

    timeline: [TimelineSchema],
  },
  {
    timestamps: true,
  }
);

AuthFormSchema.index({ bookingId: 1 }, { unique: true });
AuthFormSchema.index({ 'approval.status': 1 });

export default (mongoose.models.AuthForm as Model<IAuthForm>) ||
  mongoose.model<IAuthForm>('AuthForm', AuthFormSchema);
