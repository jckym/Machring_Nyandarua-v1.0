import mongoose, { Schema, Document } from 'mongoose';

export type ProductCategory = 
  | 'Seeds' | 'Fertilizers' | 'Agrochemicals' 
  | 'Animal Feeds & Supplements' | 'Services' | 'Equipment' | 'Others';

export interface IProduct extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  sku: string;
  inStock: number;
  unitPrice: number;
  description: string;
  commission: number; // Commission amount per unit
  category: ProductCategory;
  imageUrl?: string;
  createdBy?: mongoose.Types.ObjectId;
  lastEditedBy?: mongoose.Types.ObjectId;
  lastEditedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    sku: { type: String, required: true, unique: true, uppercase: true, trim: true },
    inStock: { type: Number, required: true, min: 0, default: 0 },
    unitPrice: { type: Number, required: true, min: 0 },
    description: { type: String, trim: true },
    commission: { type: Number, required: true, min: 0 },
    category: {
      type: String,
      enum: ['Seeds', 'Fertilizers', 'Agrochemicals', 'Animal Feeds & Supplements', 'Services', 'Equipment', 'Others'],
      required: true,
    },
    imageUrl: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    lastEditedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    lastEditedAt: { type: Date },
  },
  { timestamps: true }
);

// Indexes
productSchema.index({ sku: 1 });
productSchema.index({ category: 1 });
productSchema.index({ inStock: 1 });

export const Product = mongoose.model<IProduct>('Product', productSchema);
