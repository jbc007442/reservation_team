import { Schema, model, models, Types } from 'mongoose';

const AttendanceLogSchema = new Schema(
  {
    employee: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    attendance: {
      type: Types.ObjectId,
      ref: 'Attendance',
      required: true,
      index: true,
    },

    dateTime: {
      type: Date,
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: ['IN', 'OUT', 'BREAK_IN', 'BREAK_OUT'],
      required: true,
    },

    source: {
      type: String,
      enum: ['Manual', 'Web', 'Mobile', 'Biometric', 'Face', 'API'],
      default: 'Manual',
    },

    device: {
      type: String,
      default: '',
      trim: true,
    },

    ipAddress: {
      type: String,
      default: '',
      trim: true,
    },

    latitude: {
      type: Number,
      default: null,
    },

    longitude: {
      type: Number,
      default: null,
    },

    photo: {
      type: String,
      default: '',
    },

    remarks: {
      type: String,
      default: '',
      trim: true,
    },

    createdBy: {
      type: Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Indexes
 */

AttendanceLogSchema.index({
  employee: 1,
  dateTime: 1,
});

AttendanceLogSchema.index({
  attendance: 1,
});

AttendanceLogSchema.index({
  type: 1,
});

AttendanceLogSchema.index({
  source: 1,
});

AttendanceLogSchema.index({
  createdBy: 1,
});

export default models.AttendanceLog || model('AttendanceLog', AttendanceLogSchema);
