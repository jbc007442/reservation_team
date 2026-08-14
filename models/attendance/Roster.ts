import { Schema, model, models, Types } from 'mongoose';

const RosterSchema = new Schema(
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
      required: true,
    },

    isHoliday: {
      type: Boolean,
      default: false,
    },

    isWeeklyOff: {
      type: Boolean,
      default: false,
    },

    remarks: {
      type: String,
      default: '',
      trim: true,
    },

    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
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
 * One employee can have only one roster
 * for one date.
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

RosterSchema.index({ shift: 1 });
RosterSchema.index({ status: 1 });

export default models.Roster || model('Roster', RosterSchema);
