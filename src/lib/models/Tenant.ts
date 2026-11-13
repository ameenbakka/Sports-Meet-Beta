import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITenantSettings {
  defaultPoints: {
    first: number;
    second: number;
    third: number;
  };
  eventYear: string;
  themeColor?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface ITenant extends Document {
  name: string;
  slug: string;
  subtitle?: string;
  logoUrl?: string;
  bannerUrl?: string;
  settings: ITenantSettings;
  createdAt: Date;
  updatedAt: Date;
}

const TenantSchema = new Schema<ITenant>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    subtitle: { type: String, default: 'Annual Sports & Games Meet' },
    logoUrl: { type: String, default: '' },
    bannerUrl: { type: String, default: '' },
    settings: {
      defaultPoints: {
        first: { type: Number, default: 5 },
        second: { type: Number, default: 3 },
        third: { type: Number, default: 1 },
      },
      eventYear: { type: String, default: () => new Date().getFullYear().toString() },
      themeColor: { type: String, default: '#2563eb' },
      contactEmail: { type: String, default: '' },
      contactPhone: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

export const Tenant: Model<ITenant> =
  mongoose.models.Tenant || mongoose.model<ITenant>('Tenant', TenantSchema);
