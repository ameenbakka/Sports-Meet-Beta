import mongoose, { Schema, Document, Model } from 'mongoose';

export type ClubStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface IClub extends Document {
  name: string;
  code: string;
  convenerName: string;
  phone: string;
  email?: string;
  place?: string;
  logoUrl?: string;
  color?: string;
  status: ClubStatus;
  totalPoints: number;
  goldCount: number;
  silverCount: number;
  bronzeCount: number;
  generatedCredentials?: {
    username: string;
    initialPassword?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ClubSchema = new Schema<IClub>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    convenerName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    place: { type: String, trim: true },
    logoUrl: { type: String, default: '' },
    color: { type: String, default: '#3b82f6' },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
      index: true,
    },
    totalPoints: { type: Number, default: 0, index: true },
    goldCount: { type: Number, default: 0 },
    silverCount: { type: Number, default: 0 },
    bronzeCount: { type: Number, default: 0 },
    generatedCredentials: {
      username: { type: String },
      initialPassword: { type: String },
    },
  },
  { timestamps: true }
);

export const Club: Model<IClub> =
  mongoose.models.Club || mongoose.model<IClub>('Club', ClubSchema);
