import { Schema, model, models, Types } from 'mongoose';

const HolidaySchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    date: {
      type: Date,
      required: true,
    },

    description: {
      type: String,
      default: '',
      trim: true,
    },

    holidayType: {
      type: String,
      enum: ['National', 'Festival', 'Company', 'Optional', 'Weekend'],
      default: 'Company',
    },

    isOptional: {
      type: Boolean,
      default: false,
    },

    isRecurring: {
      type: Boolean,
      default: true,
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

HolidaySchema.index({ date: 1 });
HolidaySchema.index({ holidayType: 1 });
HolidaySchema.index({ status: 1 });

export default models.Holiday || model('Holiday', HolidaySchema);
