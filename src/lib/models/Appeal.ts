import mongoose, { Schema, Document, Model } from 'mongoose';

export type AppealStatus = 'PENDING' | 'INVESTIGATING' | 'RESOLVED_ACCEPTED' | 'RESOLVED_REJECTED';

export interface IAppeal extends Document {
  tenantId: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;
  clubId: mongoose.Types.ObjectId;
  participantId?: mongoose.Types.ObjectId;
  subject: string;
  description: string;
  evidenceUrl?: string;
  status: AppealStatus;
  adminRemarks?: string;
  submittedAt: Date;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AppealSchema = new Schema<IAppeal>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    clubId: { type: Schema.Types.ObjectId, ref: 'Club', required: true, index: true },
    participantId: { type: Schema.Types.ObjectId, ref: 'Participant' },
    subject: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    evidenceUrl: { type: String, default: '' },
    status: {
      type: String,
      enum: ['PENDING', 'INVESTIGATING', 'RESOLVED_ACCEPTED', 'RESOLVED_REJECTED'],
      default: 'PENDING',
      index: true,
    },
    adminRemarks: { type: String },
    submittedAt: { type: Date, default: Date.now },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

export const Appeal: Model<IAppeal> =
  mongoose.models.Appeal || mongoose.model<IAppeal>('Appeal', AppealSchema);
