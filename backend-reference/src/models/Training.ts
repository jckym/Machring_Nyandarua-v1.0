import mongoose, { Schema, Document } from 'mongoose';

export type TrainingStatus = 'Upcoming' | 'Completed';

export interface ITraining extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  type?: string;
  date: Date;
  status: TrainingStatus;
  attendees: mongoose.Types.ObjectId[]; // Farmer IDs
  trainerId: mongoose.Types.ObjectId; // TOT
  localMrId: mongoose.Types.ObjectId;
  topics: string[];
  location: string;
  duration: number; // hours
  images?: string[];
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const trainingSchema = new Schema<ITraining>(
  {
    title: { type: String, required: true, trim: true },
    type: { type: String, trim: true },
    date: { type: Date, required: true },
    status: { type: String, enum: ['Upcoming', 'Completed'], default: 'Upcoming' },
    attendees: [{ type: Schema.Types.ObjectId, ref: 'Farmer' }],
    trainerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    localMrId: { type: Schema.Types.ObjectId, ref: 'LocalMR', required: true },
    topics: [{ type: String, trim: true }],
    location: { type: String, required: true, trim: true },
    duration: { type: Number, required: true, min: 0.5 },
    images: [{ type: String }],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Indexes
trainingSchema.index({ trainerId: 1, date: -1 });
trainingSchema.index({ localMrId: 1 });
trainingSchema.index({ status: 1 });
trainingSchema.index({ date: 1 });

export const Training = mongoose.model<ITraining>('Training', trainingSchema);
