import mongoose, { Schema, Document } from 'mongoose';

export interface ILocalMR extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  code: string;
  subcounty: string;
  ward: string;
  managerId: mongoose.Types.ObjectId;
  regionManagerId?: mongoose.Types.ObjectId;
  totalTots: number;
  totalFarmers: number;
  createdAt: Date;
  updatedAt: Date;
}

const localMRSchema = new Schema<ILocalMR>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true, index: false },
    subcounty: { type: String, required: true, trim: true },
    ward: { type: String, required: true, trim: true },
    managerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    regionManagerId: { type: Schema.Types.ObjectId, ref: 'User' },
    totalTots: { type: Number, default: 0 },
    totalFarmers: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Indexes (code already has unique: true which creates an index)
localMRSchema.index({ managerId: 1 });
localMRSchema.index({ subcounty: 1, ward: 1 });

export const LocalMR = mongoose.model<ILocalMR>('LocalMR', localMRSchema);
