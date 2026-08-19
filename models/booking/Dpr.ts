import { Schema, model, models, Document } from 'mongoose';

export interface IDpr extends Document {
  date: Date;
  agentName: string;
  callType: 'buffer_call' | 'ppc' | 'existing' | 'expedia';
  phoneNumber: string;
  airline: string;
  callQuery:
    | 'changes'
    | 'cancellation'
    | 'shoppers_calls'
    | 'bags'
    | 'sale'
    | 'information'
    | 'non_airline'
    | 'new_booking'
    | 'follow_up'
    | 'no_voice'
    | 'junk_call_spam_blank_wrong_number'
    | 'flight_information';
  notes: string;

  createdBy?: Schema.Types.ObjectId;
  updatedBy?: Schema.Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

const DprSchema = new Schema<IDpr>(
  {
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },

    agentName: {
      type: String,
      required: true,
      trim: true,
    },

    callType: {
      type: String,
      required: true,
      enum: ['buffer_call', 'ppc', 'existing', 'expedia'],
    },

    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },

    airline: {
      type: String,
      required: true,
      trim: true,
    },

    callQuery: {
      type: String,
      required: true,
      enum: [
        'changes',
        'cancellation',
        'shoppers_calls',
        'bags',
        'sale',
        'information',
        'non_airline',
        'new_booking',
        'follow_up',
        'no_voice',
        'junk_call_spam_blank_wrong_number',
        'flight_information',
      ],
    },

    notes: {
      type: String,
      required: true,
      trim: true,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default models.Dpr || model<IDpr>('Dpr', DprSchema);