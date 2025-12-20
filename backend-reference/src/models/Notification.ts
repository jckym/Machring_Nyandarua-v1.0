import mongoose, { Schema, Document } from 'mongoose';

export type NotificationType =
  | 'sale' | 'sale_completed' | 'commission'
  | 'mechanisation' | 'mechanisation_pending' | 'mechanisation_approved' | 'mechanisation_rejected' | 'mechanisation_completed'
  | 'farmer' | 'farmer_approval'
  | 'training' | 'training_reminder'
  | 'visit' | 'visit_logged'
  | 'manager_message' | 'system'
  | 'support_request' | 'escalation' | 'failed_operation';

export interface INotification extends Document {
  _id: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  userId?: mongoose.Types.ObjectId;
  localMrId?: mongoose.Types.ObjectId;
  link?: string;
  metadata?: Record<string, any>;
  reportedBy?: mongoose.Types.ObjectId;
  issueType?: string;
  resolutionStatus?: 'pending' | 'resolved' | 'escalated';
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    type: {
      type: String,
      enum: [
        'sale', 'sale_completed', 'commission',
        'mechanisation', 'mechanisation_pending', 'mechanisation_approved', 'mechanisation_rejected', 'mechanisation_completed',
        'farmer', 'farmer_approval',
        'training', 'training_reminder',
        'visit', 'visit_logged',
        'manager_message', 'system',
        'support_request', 'escalation', 'failed_operation',
      ],
      required: true,
    },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    read: { type: Boolean, default: false },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    localMrId: { type: Schema.Types.ObjectId, ref: 'LocalMR' },
    link: { type: String },
    metadata: { type: Schema.Types.Mixed },
    reportedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    issueType: { type: String },
    resolutionStatus: { type: String, enum: ['pending', 'resolved', 'escalated'] },
  },
  { timestamps: true }
);

// Indexes
notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
notificationSchema.index({ localMrId: 1 });
notificationSchema.index({ createdAt: -1 });

export const Notification = mongoose.model<INotification>('Notification', notificationSchema);
