import mongoose, { Schema, Document } from 'mongoose';

export interface IVisit extends Document {
  _id: mongoose.Types.ObjectId;
  farmerId: mongoose.Types.ObjectId;
  totId: mongoose.Types.ObjectId;
  localMrId: mongoose.Types.ObjectId;
  date: Date;
  purpose: string;
  notes: string;
  gpsLocation?: { lat: number; lng: number };
  images?: string[];
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const visitSchema = new Schema<IVisit>(
  {
    farmerId: { type: Schema.Types.ObjectId, ref: 'Farmer', required: true },
    totId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    localMrId: { type: Schema.Types.ObjectId, ref: 'LocalMR', required: true },
    date: { type: Date, required: true, default: Date.now },
    purpose: { type: String, required: true, trim: true },
    notes: { type: String, required: true, trim: true },
    gpsLocation: {
      lat: { type: Number },
      lng: { type: Number },
    },
    images: [{ type: String }],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Indexes
visitSchema.index({ totId: 1, date: -1 });
visitSchema.index({ farmerId: 1 });
visitSchema.index({ localMrId: 1 });
visitSchema.index({ date: -1 });

export const Visit = mongoose.model<IVisit>('Visit', visitSchema);
