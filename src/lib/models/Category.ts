import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICategory extends Document {
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
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    gender: { type: String, enum: ['MALE', 'FEMALE', 'ALL'], default: 'ALL' },
    minAge: { type: Number },
    maxAge: { type: Number },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Category: Model<ICategory> =
  mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);
