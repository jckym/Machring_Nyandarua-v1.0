import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  _id: mongoose.Types.ObjectId;
  action: string;
  entity: string;
  entityId: mongoose.Types.ObjectId;
  actorId: mongoose.Types.ObjectId;
  actorRole: string;
  before?: Record<string, any>;
  after?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    action: { type: String, required: true, trim: true }, // CREATE, UPDATE, DELETE, APPROVE, REJECT, etc.
    entity: { type: String, required: true, trim: true }, // User, Farmer, Sale, etc.
    entityId: { type: Schema.Types.ObjectId, required: true },
    actorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    actorRole: { type: String, required: true },
    before: { type: Schema.Types.Mixed },
    after: { type: Schema.Types.Mixed },
    ipAddress: { type: String },
    userAgent: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Indexes for efficient querying
auditLogSchema.index({ entity: 1, entityId: 1 });
auditLogSchema.index({ actorId: 1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ createdAt: -1 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
