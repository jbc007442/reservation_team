import { Schema, model, models, Types } from 'mongoose';

const ShiftSchema = new Schema(
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

    startTime: {
      type: String,
      required: true, // 09:30
    },

    endTime: {
      type: String,
      required: true, // 18:30
    },

    breakMinutes: {
      type: Number,
      default: 60,
      min: 0,
    },

    graceInMinutes: {
      type: Number,
      default: 15,
      min: 0,
    },

    graceOutMinutes: {
      type: Number,
      default: 10,
      min: 0,
    },

    minimumWorkingMinutes: {
      type: Number,
      default: 480, // 8 Hours
      min: 0,
    },

    isNightShift: {
      type: Boolean,
      default: false,
    },

    weeklyOff: [
      {
        type: String,
        enum: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      },
    ],

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

ShiftSchema.index({ code: 1 });
ShiftSchema.index({ name: 1 });
ShiftSchema.index({ status: 1 });

export default models.Shift || model('Shift', ShiftSchema);
