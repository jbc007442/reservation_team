import { Schema, model, models, Types } from 'mongoose';

const AttendanceSchema = new Schema(
  {
    employee: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },

    date: {
      type: String,
      required: true,
    },

    checkIn: {
      type: Date,
      default: null,
    },

    checkOut: {
      type: Date,
      default: null,
    },

    workingMinutes: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ['Present', 'Absent', 'Half Day', 'Leave', 'Weekend', 'Holiday'],
      default: 'Present',
    },

    ipAddress: {
      type: String,
      default: '',
    },

    browser: {
      type: String,
      default: '',
    },

    device: {
      type: String,
      default: '',
    },

    latitude: {
      type: Number,
      default: null,
    },

    longitude: {
      type: Number,
      default: null,
    },

    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

AttendanceSchema.index(
  {
    employee: 1,
    date: 1,
  },
  {
    unique: true,
  }
);

export default models.Attendance || model('Attendance', AttendanceSchema);
