import mongoose, { Schema, Document } from 'mongoose';

export type ValueChain = 
  | 'Maize' | 'Wheat' | 'Dairy' | 'Poultry' | 'Horticulture' 
  | 'Coffee' | 'Tea' | 'Sugarcane' | 'Livestock' | 'Mixed Farming';

export type FarmerCategory = 'New' | 'Existing' | 'Pioneer';
export type FarmerRating = 'Active' | 'Dormant' | 'High-Value';

export interface IFarmer extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  phone: string;
  email?: string;
  age?: number;
  location: {
    village: string;
    ward: string;
    subcounty: string;
    county: string;
  };
  localMrId: mongoose.Types.ObjectId;
  valueChain: ValueChain;
  farmerCategory: FarmerCategory;
  farmerRating: FarmerRating;
  registeredBy: mongoose.Types.ObjectId; // TOT who registered
  totalPurchases: number;
  mechanisationCount: number;
  trainingsAttended: number;
  visitsCount: number;
  lastActivityDate?: Date;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  createdBy?: mongoose.Types.ObjectId;
  lastEditedBy?: mongoose.Types.ObjectId;
  lastEditedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const farmerSchema = new Schema<IFarmer>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true },
    age: { type: Number, min: 18, max: 120 },
    location: {
      village: { type: String, required: true, trim: true },
      ward: { type: String, required: true, trim: true },
      subcounty: { type: String, required: true, trim: true },
      county: { type: String, required: true, trim: true },
    },
    localMrId: { type: Schema.Types.ObjectId, ref: 'LocalMR', required: true },
    valueChain: {
      type: String,
      enum: ['Maize', 'Wheat', 'Dairy', 'Poultry', 'Horticulture', 'Coffee', 'Tea', 'Sugarcane', 'Livestock', 'Mixed Farming'],
      required: true,
    },
    farmerCategory: { type: String, enum: ['New', 'Existing', 'Pioneer'], default: 'New' },
    farmerRating: { type: String, enum: ['Active', 'Dormant', 'High-Value'], default: 'Active' },
    registeredBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    totalPurchases: { type: Number, default: 0 },
    mechanisationCount: { type: Number, default: 0 },
    trainingsAttended: { type: Number, default: 0 },
    visitsCount: { type: Number, default: 0 },
    lastActivityDate: { type: Date },
    approvalStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    lastEditedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    lastEditedAt: { type: Date },
  },
  { timestamps: true }
);

// Indexes
farmerSchema.index({ localMrId: 1, registeredBy: 1 });
farmerSchema.index({ 'location.subcounty': 1, 'location.ward': 1 });
farmerSchema.index({ approvalStatus: 1 });
farmerSchema.index({ phone: 1 });

export const Farmer = mongoose.model<IFarmer>('Farmer', farmerSchema);
