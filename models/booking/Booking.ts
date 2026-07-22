import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IBooking extends Document {
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
    departureDate: Date;
    returnDate?: Date;
    adults: number;
    children: number;
    infants: number;
  };

  service:
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

  callType?: 'Buffer' | 'PPC' | 'Meta' | 'Other';

  websites?: string[];

  saleType?: 'fresh' | 'repeat' | 'referral';

  remark?: string;

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

  assignedTo?: mongoose.Types.ObjectId;
  createdBy?: mongoose.Types.ObjectId;
}

const BookingSchema = new Schema<IBooking>(
  {
    bookingNo: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    customer: {
      title: {
        type: String,
        trim: true,
      },
      name: {
        type: String,
        required: true,
        trim: true,
      },
      mobile: {
        type: String,
        required: true,
        trim: true,
      },
      email: {
        type: String,
        lowercase: true,
        trim: true,
      },
    },

    journey: {
      fromCity: {
        type: String,
        required: true,
      },
      toCity: {
        type: String,
        required: true,
      },
      departureDate: {
        type: Date,
        required: true,
      },
      returnDate: Date,

      adults: {
        type: Number,
        default: 1,
        min: 1,
      },

      children: {
        type: Number,
        default: 0,
        min: 0,
      },

      infants: {
        type: Number,
        default: 0,
        min: 0,
      },
    },

    service: {
      type: String,
      enum: [
        'Package',
        'Flight',
        'Hotel',
        'Hotel + Flight',
        'Cargo',
        'Pet',
        'Car',
        'Cruise',
        'Amtrak',
        'Other',
      ],
      required: true,
    },

    callType: {
      type: String,
      enum: ['Buffer', 'PPC', 'Meta', 'Other'],
    },

    websites: {
      type: [String],
      default: [],
    },

    saleType: {
      type: String,
      enum: ['fresh', 'repeat', 'referral'],
    },

    remark: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: [
        'booking_created',
        'auth_pending',
        'auth_completed',
        'ticketed',
        'cancelled',
        'refunded',
        'charge_back',
        'follow_up',
        'card_charged',
        'card_decline',
      ],
      default: 'booking_created',
    },

    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

BookingSchema.index({ status: 1 });
BookingSchema.index({ assignedTo: 1 });
BookingSchema.index({ createdAt: -1 });

export default (mongoose.models.Booking as Model<IBooking>) ||
  mongoose.model<IBooking>('Booking', BookingSchema);
