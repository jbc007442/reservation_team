import { Schema, model, models, Types } from 'mongoose';

const AttendanceSchema = new Schema(
  {
    /*
    |--------------------------------------------------------------------------
    | Employee
    |--------------------------------------------------------------------------
    */
    employee: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    /*
    |--------------------------------------------------------------------------
    | Attendance Date
    |--------------------------------------------------------------------------
    | One attendance record per employee per day.
    */
    date: {
      type: Date,
      required: true,
    },

    /*
    |--------------------------------------------------------------------------
    | Check In / Check Out
    |--------------------------------------------------------------------------
    */
    checkIn: {
      type: Date,
      default: null,
    },

    checkOut: {
      type: Date,
      default: null,
    },

    /*
    |--------------------------------------------------------------------------
    | Current Employee State
    |--------------------------------------------------------------------------
    */
    currentStatus: {
      type: String,
      enum: ['Working', 'On Break', 'Checked Out'],
      default: 'Working',
      index: true,
    },

    /*
    |--------------------------------------------------------------------------
    | Last Activity
    |--------------------------------------------------------------------------
    */
    lastActivityAt: {
      type: Date,
      default: null,
    },

    /*
    |--------------------------------------------------------------------------
    | Working Time
    |--------------------------------------------------------------------------
    | Stored in minutes.
    */
    workingMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },

    /*
    |--------------------------------------------------------------------------
    | Break Time
    |--------------------------------------------------------------------------
    | Total break duration for the day in minutes.
    */
    breakMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },

    /*
    |--------------------------------------------------------------------------
    | Attendance Status
    |--------------------------------------------------------------------------
    */
    status: {
      type: String,
      enum: ['Present', 'Absent', 'Half Day', 'Leave', 'Holiday', 'Weekly Off'],
      default: 'Absent',
      index: true,
    },

    /*
    |--------------------------------------------------------------------------
    | Attendance Approval
    |--------------------------------------------------------------------------
    */
    approvedBy: {
      type: Types.ObjectId,
      ref: 'User',
      default: null,
    },

    approvedAt: {
      type: Date,
      default: null,
    },

    /*
    |--------------------------------------------------------------------------
    | Audit
    |--------------------------------------------------------------------------
    */
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

/*
|--------------------------------------------------------------------------
| One Attendance Record Per Employee Per Day
|--------------------------------------------------------------------------
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

/*
|--------------------------------------------------------------------------
| Common Queries
|--------------------------------------------------------------------------
*/

AttendanceSchema.index({
  employee: 1,
  status: 1,
});

AttendanceSchema.index({
  employee: 1,
  currentStatus: 1,
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
  createdBy: 1,
});

export default models.Attendance || model('Attendance', AttendanceSchema);
