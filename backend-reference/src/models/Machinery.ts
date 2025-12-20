import mongoose, { Schema, Document } from 'mongoose';

export type MachineryStatus = 'available' | 'booked' | 'maintenance';

export interface IMachinery extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  category: string;
  type?: string;
  status: MachineryStatus;
  pricePerAcre: number;
  localMrId?: mongoose.Types.ObjectId;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const machinerySchema = new Schema<IMachinery>(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    type: { type: String, trim: true },
    status: { type: String, enum: ['available', 'booked', 'maintenance'], default: 'available' },
    pricePerAcre: { type: Number, required: true, min: 0 },
    localMrId: { type: Schema.Types.ObjectId, ref: 'LocalMR' },
    description: { type: String, trim: true },
  },
  { timestamps: true }
);

// Indexes
machinerySchema.index({ status: 1 });
machinerySchema.index({ localMrId: 1 });
machinerySchema.index({ category: 1 });

export const Machinery = mongoose.model<IMachinery>('Machinery', machinerySchema);
