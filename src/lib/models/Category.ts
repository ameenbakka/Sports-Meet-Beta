import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICategory extends Document {
  tenantId: mongoose.Types.ObjectId;
  name: string;
  code: string;
  gender: 'MALE' | 'FEMALE' | 'ALL';
  minAge?: number;
  maxAge?: number;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, uppercase: true, trim: true },
    gender: { type: String, enum: ['MALE', 'FEMALE', 'ALL'], default: 'ALL' },
    minAge: { type: Number },
    maxAge: { type: Number },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

CategorySchema.index({ tenantId: 1, code: 1 }, { unique: true });

export const Category: Model<ICategory> =
  mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);
