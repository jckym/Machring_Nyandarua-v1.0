import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole = 'admin' | 'manager' | 'tot';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  localMrId?: mongoose.Types.ObjectId;
  status: 'active' | 'inactive';
  avatar?: string;
  lastActivityDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ['admin', 'manager', 'tot'], required: true },
    localMrId: { type: Schema.Types.ObjectId, ref: 'LocalMR' },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    avatar: { type: String },
    lastActivityDate: { type: Date },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Index for faster queries
userSchema.index({ role: 1, localMrId: 1 });
userSchema.index({ email: 1 });

export const User = mongoose.model<IUser>('User', userSchema);
