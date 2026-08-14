import { Schema, model, models, Types } from 'mongoose';

const AttendanceSchema = new Schema(
  {
    employee: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    date: {
      type: Date,
      required: true,
      index: true,
    },

    shift: {
      type: Types.ObjectId,
      ref: 'Shift',
      default: null,
    },

    roster: {
      type: Types.ObjectId,
      ref: 'Roster',
      default: null,
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
      min: 0,
    },

    breakMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },

    overtimeMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },

    lateMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },

    earlyExitMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },

    status: {
      type: String,
      enum: ['Present', 'Absent', 'Half Day', 'Leave', 'Holiday', 'Weekly Off'],
      default: 'Absent',
      index: true,
    },

    attendanceSource: {
      type: String,
      enum: ['Manual', 'Web', 'Mobile', 'Biometric', 'Face', 'API'],
      default: 'Manual',
    },

    notes: {
      type: String,
      default: '',
      trim: true,
    },

    approvedBy: {
      type: Types.ObjectId,
      ref: 'User',
      default: null,
    },

    approvedAt: {
      type: Date,
      default: null,
    },

    createdBy: {
      type: Types.ObjectId,
      ref: 'User',
      default: null,
    },

    updatedBy: {
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
 * One attendance record
 * per employee per day
 */
AttendanceSchema.index(
  {
    employee: 1,
    date: 1,
  },
  {
    unique: true,
  }
);

/**
 * Common Queries
 */

AttendanceSchema.index({
  employee: 1,
  status: 1,
});

AttendanceSchema.index({
  employee: 1,
  checkIn: 1,
});

AttendanceSchema.index({
  employee: 1,
  checkOut: 1,
});

AttendanceSchema.index({
  shift: 1,
});

AttendanceSchema.index({
  roster: 1,
});

AttendanceSchema.index({
  attendanceSource: 1,
});

AttendanceSchema.index({
  date: 1,
});

AttendanceSchema.index({
  createdBy: 1,
});

export default models.Attendance || model('Attendance', AttendanceSchema);
