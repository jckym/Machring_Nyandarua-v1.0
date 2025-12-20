import mongoose, { Schema, Document } from 'mongoose';

export type SaleStatus = 'pending' | 'completed' | 'cancelled';

export interface ISale extends Document {
  _id: mongoose.Types.ObjectId;
  totId: mongoose.Types.ObjectId;
  localMrId: mongoose.Types.ObjectId;
  farmerId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  quantity: number;
  unitPrice: number;
  total: number;
  commissionAmount: number;
  date: Date;
  status: SaleStatus;
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  cancellationReason?: string;
  createdBy?: mongoose.Types.ObjectId;
  lastEditedBy?: mongoose.Types.ObjectId;
  lastEditedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const saleSchema = new Schema<ISale>(
  {
    totId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    localMrId: { type: Schema.Types.ObjectId, ref: 'LocalMR', required: true },
    farmerId: { type: Schema.Types.ObjectId, ref: 'Farmer', required: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    commissionAmount: { type: Number, required: true, min: 0 },
    date: { type: Date, required: true, default: Date.now },
    status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'pending' },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
    cancellationReason: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    lastEditedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    lastEditedAt: { type: Date },
  },
  { timestamps: true }
);

// Pre-save hook to calculate total and commission
saleSchema.pre('save', async function (next) {
  if (this.isModified('quantity') || this.isModified('unitPrice')) {
    this.total = this.quantity * this.unitPrice;
  }
  next();
});

// Indexes
saleSchema.index({ totId: 1, date: -1 });
saleSchema.index({ farmerId: 1 });
saleSchema.index({ localMrId: 1, status: 1 });
saleSchema.index({ productId: 1 });
saleSchema.index({ status: 1 });
saleSchema.index({ date: -1 });

export const Sale = mongoose.model<ISale>('Sale', saleSchema);
