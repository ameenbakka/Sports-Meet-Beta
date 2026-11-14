import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IParticipant extends Document {
  tenantId: mongoose.Types.ObjectId;
  clubId: mongoose.Types.ObjectId;
  categoryId: mongoose.Types.ObjectId;
  name: string;
  chestNumber: string;
  gender: 'MALE' | 'FEMALE';
  dob?: Date;
  photoUrl?: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ParticipantSchema = new Schema<IParticipant>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    clubId: { type: Schema.Types.ObjectId, ref: 'Club', required: true, index: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    name: { type: String, required: true, trim: true },
    chestNumber: { type: String, required: true, trim: true, uppercase: true },
    gender: { type: String, enum: ['MALE', 'FEMALE'], required: true },
    dob: { type: Date },
    photoUrl: { type: String, default: '' },
    phone: { type: String, trim: true },
  },
  { timestamps: true }
);

ParticipantSchema.index({ tenantId: 1, chestNumber: 1 }, { unique: true });
ParticipantSchema.index({ tenantId: 1, clubId: 1 });

export const Participant: Model<IParticipant> =
  mongoose.models.Participant || mongoose.model<IParticipant>('Participant', ParticipantSchema);
