import mongoose, { Schema, Document } from 'mongoose';

export type ApprovalType = 'FARMER_ADD' | 'FARMER_EDIT' | 'MECHANISATION' | 'SALE_ADJUSTMENT';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface IApprovalRequest extends Document {
  _id: mongoose.Types.ObjectId;
  type: ApprovalType;
  status: ApprovalStatus;
  requestedBy: mongoose.Types.ObjectId;
  targetEntityId?: mongoose.Types.ObjectId;
  entity: string; // Farmer, MechanisationJob, Sale
  payload: Record<string, any>; // The data being requested
  localMrId: mongoose.Types.ObjectId;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const approvalRequestSchema = new Schema<IApprovalRequest>(
  {
    type: {
      type: String,
      enum: ['FARMER_ADD', 'FARMER_EDIT', 'MECHANISATION', 'SALE_ADJUSTMENT'],
      required: true,
    },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    requestedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    targetEntityId: { type: Schema.Types.ObjectId },
    entity: { type: String, required: true },
    payload: { type: Schema.Types.Mixed, required: true },
    localMrId: { type: Schema.Types.ObjectId, ref: 'LocalMR', required: true },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
    rejectionReason: { type: String },
  },
  { timestamps: true }
);

// Indexes
approvalRequestSchema.index({ status: 1, localMrId: 1 });
approvalRequestSchema.index({ requestedBy: 1 });
approvalRequestSchema.index({ type: 1 });
approvalRequestSchema.index({ createdAt: -1 });

export const ApprovalRequest = mongoose.model<IApprovalRequest>('ApprovalRequest', approvalRequestSchema);
