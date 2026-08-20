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

    rosterStatus: {
      type: String,
      enum: ['P', 'WO', 'L', 'H', 'HD', 'A', 'OD', 'WFH'],
      default: 'P',
      required: true,
    },

    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
      index: true,
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

export default models.Roster || model('Roster', RosterSchema);
