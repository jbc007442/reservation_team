import { Schema, model, models, Types } from 'mongoose';

const LeaveSchema = new Schema(
  {
    employee: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    leaveType: {
      type: Types.ObjectId,
      ref: 'LeaveType',
      required: true,
    },

    fromDate: {
      type: Date,
      required: true,
    },

    toDate: {
      type: Date,
      required: true,
    },

    totalDays: {
      type: Number,
      required: true,
      min: 0.5,
    },

    reason: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Cancelled'],
      default: 'Pending',
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

    rejectionReason: {
      type: String,
      default: '',
      trim: true,
    },

    remarks: {
      type: String,
      default: '',
      trim: true,
    },

    attachment: {
      type: String,
      default: '',
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
 * Indexes
 */

LeaveSchema.index({ employee: 1 });

LeaveSchema.index({ leaveType: 1 });

LeaveSchema.index({ status: 1 });

LeaveSchema.index({
  employee: 1,
  fromDate: 1,
  toDate: 1,
});

LeaveSchema.index({
  fromDate: 1,
  toDate: 1,
});

export default models.Leave || model('Leave', LeaveSchema);
