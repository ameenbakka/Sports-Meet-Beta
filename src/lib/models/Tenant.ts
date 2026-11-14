import mongoose, { Schema, Document, Model } from 'mongoose';

export type TenantStatus = 'ACTIVE' | 'PENDING' | 'SUSPENDED';

export interface ITenantSettings {
  firstPlacePoints: number;
  secondPlacePoints: number;
  thirdPlacePoints: number;
  fourthPlacePoints: number;
  themeColor?: string;
  meetDates?: string;
  venue?: string;
  description?: string;
}

export interface ITenant extends Document {
  name: string;
  slug: string;
  contactEmail: string;
  contactPhone?: string;
  status: TenantStatus;
  logoUrl?: string;
  bannerUrl?: string;
  settings: ITenantSettings;
  createdAt: Date;
  updatedAt: Date;
}

const TenantSchema = new Schema<ITenant>(
  {
    name: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: /^[a-z0-9-]+$/,
    },
    contactEmail: { type: String, required: true, trim: true, lowercase: true },
    contactPhone: { type: String, trim: true },
    status: {
      type: String,
      enum: ['ACTIVE', 'PENDING', 'SUSPENDED'],
      default: 'ACTIVE',
      required: true,
    },
    logoUrl: { type: String, trim: true },
    bannerUrl: { type: String, trim: true },
    settings: {
      firstPlacePoints: { type: Number, default: 5 },
      secondPlacePoints: { type: Number, default: 3 },
      thirdPlacePoints: { type: Number, default: 1 },
      fourthPlacePoints: { type: Number, default: 0 },
      themeColor: { type: String, default: '#2563eb' },
      meetDates: { type: String, default: '' },
      venue: { type: String, default: '' },
      description: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

export const Tenant: Model<ITenant> =
  mongoose.models.Tenant || mongoose.model<ITenant>('Tenant', TenantSchema);
