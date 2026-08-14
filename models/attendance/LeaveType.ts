import { Schema, model, models, Types } from 'mongoose';

const LeaveTypeSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      unique: true,
    },

    description: {
      type: String,
      default: '',
      trim: true,
    },

    paid: {
      type: Boolean,
      default: true,
    },

    yearlyQuota: {
      type: Number,
      default: 0,
      min: 0,
    },

    carryForward: {
      type: Boolean,
      default: false,
    },

    maxConsecutiveDays: {
      type: Number,
      default: 365,
      min: 1,
    },

    requiresApproval: {
      type: Boolean,
      default: true,
    },

    color: {
      type: String,
      default: '#3B82F6',
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

LeaveTypeSchema.index({ code: 1 });
LeaveTypeSchema.index({ name: 1 });
LeaveTypeSchema.index({ status: 1 });

export default models.LeaveType || model('LeaveType', LeaveTypeSchema);
