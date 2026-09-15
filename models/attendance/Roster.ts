import { Schema, model, models, Types } from 'mongoose';

const RosterSchema = new Schema(
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
    | Date
    |--------------------------------------------------------------------------
    */

    date: {
      type: Date,
      required: true,
      index: true,
    },

    /*
    |--------------------------------------------------------------------------
    | Common Attendance / Roster Status
    |--------------------------------------------------------------------------
    |
    | P   = Present
    | WO  = Weekly Off
    | L   = Leave
    | H   = Holiday
    | HD  = Half Day
    | A   = Absent
    | OD  = On Duty
    | WFH = Work From Home
    | SL  = Short Login
    |
    | This is the COMMON status.
    |
    | Admin can initially assign a status.
    | Login/logout logic can update it based
    | on actual working minutes.
    |--------------------------------------------------------------------------
    */

    status: {
      type: String,
      enum: ['P', 'WO', 'L', 'H', 'HD', 'A', 'OD', 'WFH', 'SL'],
      default: 'A',
      required: true,
      index: true,
    },

    /*
    |--------------------------------------------------------------------------
    | Roster Record Status
    |--------------------------------------------------------------------------
    |
    | Controls whether this roster record is active.
    |
    |--------------------------------------------------------------------------
    */

    rosterStatus: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
      index: true,
    },

    /*
    |--------------------------------------------------------------------------
    | Created By
    |--------------------------------------------------------------------------
    */

    createdBy: {
      type: Types.ObjectId,
      ref: 'User',
      default: null,
    },

    /*
    |--------------------------------------------------------------------------
    | Updated By
    |--------------------------------------------------------------------------
    */

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
| One Employee Can Have One Roster Per Date
|--------------------------------------------------------------------------
*/

RosterSchema.index(
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
| Employee + Status Queries
|--------------------------------------------------------------------------
*/

RosterSchema.index({
  employee: 1,
  status: 1,
});

RosterSchema.index({
  employee: 1,
  rosterStatus: 1,
});

RosterSchema.index({
  date: 1,
  status: 1,
});

export default models.Roster || model('Roster', RosterSchema);
