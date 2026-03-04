import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const USER_ROLES = [
  'ADMIN', 'CONSTABLE', 'SI', 'INSPECTOR', 'DSP', 'ASP', 'SP', 'DIG', 'IG', 'DGP'
];

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  // Stored hashed password
  password: {
    type: String,
    required: true,
    select: false
  },
  role: {
    type: String,
    enum: USER_ROLES,
    required: true,
    index: true
  },
  station: { type: String, trim: true, default: null },
  status: { type: String, enum: ['ACTIVE', 'SUSPENDED'], default: 'ACTIVE', index: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  lastLoginAt: { type: Date, default: null },

  // Optional profile fields
  name: { type: String, required: true, trim: true },
  rank: { type: String, trim: true },
  badgeNumber: { type: String, trim: true },
  phone: { type: String, trim: true },
  avatar: { type: String },

  // Permissions can be used for overrides
  permissions: { type: [String], default: [] }

}, {
  timestamps: true,
  versionKey: false
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Clean JSON output
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export const User = mongoose.model('User', userSchema);
