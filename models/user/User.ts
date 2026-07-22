import { Schema, model, models } from 'mongoose';

const UserSchema = new Schema(
  {
    employeeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
    },

    dateOfBirth: {
      type: Date,
      default: null,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ['admin', 'employee'],
      default: 'employee',
    },

    department: {
      type: String,
      default: '',
    },

    designation: {
      type: String,
      default: '',
    },

    joiningDate: {
      type: Date,
      default: null,
    },

    address: {
      addressLine1: {
        type: String,
        default: '',
        trim: true,
      },

      addressLine2: {
        type: String,
        default: '',
        trim: true,
      },

      city: {
        type: String,
        default: '',
        trim: true,
      },

      state: {
        type: String,
        default: '',
        trim: true,
      },

      country: {
        type: String,
        default: '',
        trim: true,
      },

      postalCode: {
        type: String,
        default: '',
        trim: true,
      },
    },

    documents: {
      aadhaarNumber: {
        type: String,
        default: '',
        trim: true,
      },

      panNumber: {
        type: String,
        default: '',
        trim: true,
        uppercase: true,
      },

      drivingLicenseNumber: {
        type: String,
        default: '',
        trim: true,
        uppercase: true,
      },
    },

    bank: {
      accountHolderName: {
        type: String,
        default: '',
        trim: true,
      },

      accountNumber: {
        type: String,
        default: '',
        trim: true,
      },

      ifscCode: {
        type: String,
        default: '',
        uppercase: true,
        trim: true,
      },

      bankName: {
        type: String,
        default: '',
        trim: true,
      },

      branchName: {
        type: String,
        default: '',
        trim: true,
      },

      accountType: {
        type: String,
        enum: ['Savings', 'Current', 'Salary', 'NRE', 'NRO'],
        default: 'Savings',
      },
    },

    avatar: {
      type: String,
      default: '',
    },

    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

export default models.User || model('User', UserSchema);
