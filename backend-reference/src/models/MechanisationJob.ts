import mongoose, { Schema, Document } from 'mongoose';

export type MechanisationStatus = 
  | 'pending-approval' | 'approved' | 'rejected' 
  | 'in-progress' | 'completed' | 'cancelled';

export type ServiceType = 'ploughing' | 'harrowing' | 'planting' | 'harvesting' | 'spraying';

export interface IMechanisationJob extends Document {
  _id: mongoose.Types.ObjectId;
  farmerId: mongoose.Types.ObjectId;
  localMrId: mongoose.Types.ObjectId;
  machineryId: mongoose.Types.ObjectId;
  serviceType: ServiceType;
  acreage: number;
  pricePerAcre: number;
  totalPrice: number;
  commissionAmount: number;
  status: MechanisationStatus;
  bookedBy: mongoose.Types.ObjectId; // TOT
  scheduledDate: Date;
  completedDate?: Date;
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  rejectedBy?: mongoose.Types.ObjectId;
  rejectedAt?: Date;
  rejectionReason?: string;
  rescheduledDate?: Date;
  gpsLocation?: { lat: number; lng: number };
  notes?: string;
  completionReport?: {
    summary: string;
    duration: string;
    outcome: string;
    completedAt: Date;
  };
  createdBy?: mongoose.Types.ObjectId;
  lastEditedBy?: mongoose.Types.ObjectId;
  lastEditedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const mechanisationJobSchema = new Schema<IMechanisationJob>(
  {
    farmerId: { type: Schema.Types.ObjectId, ref: 'Farmer', required: true },
    localMrId: { type: Schema.Types.ObjectId, ref: 'LocalMR', required: true },
    machineryId: { type: Schema.Types.ObjectId, ref: 'Machinery', required: true },
    serviceType: {
      type: String,
      enum: ['ploughing', 'harrowing', 'planting', 'harvesting', 'spraying'],
      required: true,
    },
    acreage: { type: Number, required: true, min: 0.1 },
    pricePerAcre: { type: Number, required: true, min: 0 },
    totalPrice: { type: Number, required: true, min: 0 },
    commissionAmount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['pending-approval', 'approved', 'rejected', 'in-progress', 'completed', 'cancelled'],
      default: 'pending-approval',
    },
    bookedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    scheduledDate: { type: Date, required: true },
    completedDate: { type: Date },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
    rejectedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    rejectedAt: { type: Date },
    rejectionReason: { type: String },
    rescheduledDate: { type: Date },
    gpsLocation: {
      lat: { type: Number },
      lng: { type: Number },
    },
    notes: { type: String },
    completionReport: {
      summary: { type: String },
      duration: { type: String },
      outcome: { type: String },
      completedAt: { type: Date },
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    lastEditedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    lastEditedAt: { type: Date },
  },
  { timestamps: true }
);

// Pre-save hook to calculate total price
mechanisationJobSchema.pre('save', function (next) {
  if (this.isModified('acreage') || this.isModified('pricePerAcre')) {
    this.totalPrice = this.acreage * this.pricePerAcre;
    this.commissionAmount = this.totalPrice * 0.1; // 10% commission
  }
  next();
});

// Indexes
mechanisationJobSchema.index({ bookedBy: 1, scheduledDate: -1 });
mechanisationJobSchema.index({ farmerId: 1 });
mechanisationJobSchema.index({ localMrId: 1, status: 1 });
mechanisationJobSchema.index({ status: 1 });
mechanisationJobSchema.index({ scheduledDate: 1 });

export const MechanisationJob = mongoose.model<IMechanisationJob>('MechanisationJob', mechanisationJobSchema);
