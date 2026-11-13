import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMeetSettings extends Document {
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
    name: { type: String, default: 'ചെറുകാവ് ഗ്രാമപഞ്ചായത്ത് കേരളോത്സവം 2024' },
    subtitle: { type: String, default: 'Annual Sports & Athletic Championship' },
    eventYear: { type: String, default: '2024-25' },
    themeColor: { type: String, default: '#2563eb' },
    contactEmail: { type: String, default: 'sports@keralotsavam.online' },
    contactPhone: { type: String, default: '+91 98765 43210' },
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
