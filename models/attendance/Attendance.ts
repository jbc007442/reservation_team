import { Schema, model, models, Types } from 'mongoose';

/*
|--------------------------------------------------------------------------
| AM / PM Session
|--------------------------------------------------------------------------
*/

const SessionSchema = new Schema(
  {
    checkIn: {
      type: Date,
      default: null,
    },

    checkOut: {
      type: Date,
      default: null,
    },

    currentStatus: {
      type: String,
      enum: ['Working', 'On Break', 'Checked Out'],
      default: 'Checked Out',
      index: true,
    },

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
    */

    breakMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },

    /*
    |--------------------------------------------------------------------------
    | Automatic 10 Hour Logout
    |--------------------------------------------------------------------------
    */

    autoLoggedOut: {
      type: Boolean,
      default: false,
    },

    autoLogoutAt: {
      type: Date,
      default: null,
    },
  },
  {
    _id: false,
  }
);

/*
|--------------------------------------------------------------------------
| Attendance
|--------------------------------------------------------------------------
*/

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
    */

    date: {
      type: Date,
      required: true,
    },

    /*
    |--------------------------------------------------------------------------
    | AM Session
    |--------------------------------------------------------------------------
    */

    am: {
      type: SessionSchema,
      default: () => ({}),
    },

    /*
    |--------------------------------------------------------------------------
    | PM Session
    |--------------------------------------------------------------------------
    */

    pm: {
      type: SessionSchema,
      default: () => ({}),
    },

    /*
    |--------------------------------------------------------------------------
    | Overall Current Employee State
    |--------------------------------------------------------------------------
    */

    currentStatus: {
      type: String,
      enum: ['Working', 'On Break', 'Checked Out'],
      default: 'Checked Out',
      index: true,
    },

    /*
    |--------------------------------------------------------------------------
    | Overall Last Activity
    |--------------------------------------------------------------------------
    */

    lastActivityAt: {
      type: Date,
      default: null,
    },

    /*
    |--------------------------------------------------------------------------
    | Total Working Time
    |--------------------------------------------------------------------------
    | AM + PM working minutes.
    */

    workingMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },

    /*
    |--------------------------------------------------------------------------
    | Total Break Time
    |--------------------------------------------------------------------------
    | AM + PM break minutes.
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
  'am.checkIn': 1,
});

AttendanceSchema.index({
  employee: 1,
  'am.checkOut': 1,
});

AttendanceSchema.index({
  employee: 1,
  'pm.checkIn': 1,
});

AttendanceSchema.index({
  employee: 1,
  'pm.checkOut': 1,
});

AttendanceSchema.index({
  createdBy: 1,
});

export default models.Attendance || model('Attendance', AttendanceSchema);
