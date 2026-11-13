import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IParticipant extends Document {
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
    clubId: { type: Schema.Types.ObjectId, ref: 'Club', required: true, index: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    name: { type: String, required: true, trim: true },
    chestNumber: { type: String, required: true, unique: true, trim: true, uppercase: true },
    gender: { type: String, enum: ['MALE', 'FEMALE'], required: true },
    dob: { type: Date },
    photoUrl: { type: String, default: '' },
    phone: { type: String, trim: true },
  },
  { timestamps: true }
);

export const Participant: Model<IParticipant> =
  mongoose.models.Participant || mongoose.model<IParticipant>('Participant', ParticipantSchema);
