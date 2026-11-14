import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMeetSettings extends Document {
  tenantId: mongoose.Types.ObjectId;
  name: string;
  subtitle: string;
  eventYear: string;
  themeColor: string;
  contactEmail?: string;
  contactPhone?: string;
  defaultPoints: {
    first: number;
    second: number;
    third: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const MeetSettingsSchema = new Schema<IMeetSettings>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, unique: true, index: true },
    name: { type: String, default: 'Annual Sports & Athletic Championship' },
    subtitle: { type: String, default: 'Sports Meet Management Portal' },
    eventYear: { type: String, default: '2026' },
    themeColor: { type: String, default: '#2563eb' },
    contactEmail: { type: String, default: 'admin@kalolsavam.online' },
    contactPhone: { type: String, default: '' },
    defaultPoints: {
      first: { type: Number, default: 5 },
      second: { type: Number, default: 3 },
      third: { type: Number, default: 1 },
    },
  },
  { timestamps: true }
);

export const MeetSettings: Model<IMeetSettings> =
  mongoose.models.MeetSettings ||
  mongoose.model<IMeetSettings>('MeetSettings', MeetSettingsSchema);
